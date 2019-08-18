const namePattern = '[a-zA-Z_]\\w*'

function generateRandomValue(min, max, extra, isReal) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

// also processes generator patterns
export function processNumberedSets(originalStructure, preGeneratedValues) {
  const result          = []
  const generatorValues = []

  // get generatorSets
  const generatorSetPattern = new RegExp(`^\\^(${namePattern})\\[(.*)\\]$`)
  const generatorSets       = []

  for (const [i, set] of originalStructure.entries()) {
    for (const elem of set) {

      let match
      if (match = elem[2].match(generatorSetPattern)) {
        generatorSets.push({
          name: match[1],
          elements: match[2].substr(1, match[2].length - 2).split(new RegExp(`['"],["']`)), // match[2].split(new RegExp('(?<="),(?=")')),
        })
      }
    }
  }

  const lastMinutePattern = new RegExp(`^\\^!!(?:${namePattern}\\?\\??)?`)

  const uniquenessConstraintSymbol   = '\\$'
  const uniquenessConstraintPattern =
    `(?:(${namePattern})${uniquenessConstraintSymbol})?`

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
  const realIntGenerator =
    `(${realOrIntPattern}),(${realOrIntPattern})(?:,(${intPattern}))?`

  const positionSymbol  = ':'
  const positionPattern = `(?:${positionSymbol}(n(?:-\\d+)?|-\\d|\\d+))?`

  const generatorSymbol = '#'
  const generatorPattern = new RegExp(
    `^\\^${uniquenessConstraintPattern}` +
    `(?:${realIntGenerator}|` +
    `(${namePattern})${positionPattern})${generatorSymbol}$`
  )

  const contentElementPattern = new RegExp('^[^\\^]')

  const uniquenessSets = []

  for (const [i, set] of originalStructure.entries()) {

    const contentElements = []
    let lastMinute = false

    for (const elem of set) {

      let patternResult

      if (lastMinutePattern.test(elem[2])) {
        lastMinute = true
      }

      else if (patternResult = elem[2].match(generatorPattern)) {

        const uniquenessConstraintName = patternResult[1]

        const minValue   = patternResult[2]
        const maxValue   = patternResult[3]
        const extraValue = patternResult[4]

        const generatorSetName  = patternResult[5]
        const generatorSetIndex = Number(patternResult[6])

        if (uniquenessConstraintName &&
          !uniquenessSets.find(v => v.name === uniquenessConstraintName)) {
          uniquenessSets.push({
            name: uniquenessConstraintName,
            values: []
          })
        }

        const setIndex  = elem[0]
        const elemIndex = elem[1]

        let resultValue

        let maybePregeneratedValue
        if (maybePregeneratedValue = preGeneratedValues
          .find(v => v[0] === setIndex && v[1] === elemIndex)) {
          resultValue = maybePregeneratedValue[2]
        }

        else if (minValue && maxValue) {
          // generate a random integer or real number
          const isReal = minValue.includes('.') || maxValue.includes('.')

          resultValue = generateRandomValue(
            Number(minValue),
            Number(maxValue),
            Number(extraValue),
            isReal,
          )

          if (uniquenessConstraintName) {
            let countIdx = 0
            const countIdxMax = 1000

            while (uniquenessSets
              .find(v => v.name === uniquenessConstraintName)
              .values.includes(resultValue)
              && countIdx < countIdxMax) {

              resultValue = generateRandomValue(
                Number(minValue),
                Number(maxValue),
                Number(extraValue),
                isReal,
              )

              countIdx++
            }

            if (countIdx == countIdxMax) {
              resultValue = null
            }
          }
        }

        else {
          // generator set name

          const foundGeneratorSet = generatorSets
            .find(v => v.name === generatorSetName)

          if (foundGeneratorSet) {

            resultValue = typeof generatorSetIndex !== 'number' || Number.isNaN(generatorSetIndex)
              ? foundGeneratorSet.elements[Math.floor(Math.random() * foundGeneratorSet.elements.length)]
              : generatorSetIndex >= 0
                ? foundGeneratorSet.elements[
                  foundGeneratorSet.elements.length <= generatorSetIndex
                    ? null // foundGeneratorSet.elements.length - 1
                    : generatorSetIndex
                ]
                : foundGeneratorSet.elements[
                  foundGeneratorSet.elements.length + generatorSetIndex < 0
                    ? null // 0
                    : foundGeneratorSet.elements.length + generatorSetIndex
                ]

            if (uniquenessConstraintName) {
              let countIdx = 0
              const countIdxMax = 1000

              while (uniquenessSets
                .find(v => v.name === uniquenessConstraintName)
                .values.includes(resultValue)
                && countIdx < countIdxMax) {

                const idx   = Math.floor(Math.random() * foundGeneratorSet.elements.length)
                resultValue = foundGeneratorSet.elements[idx]

                countIdx++
              }

              if (countIdx == countIdxMax) {
                resultValue = null
              }
            }
          }
        }
        // else -> no element can be generated
        // get resultValue2

        if (resultValue) {
          const resultValue2 = [setIndex, elemIndex, resultValue]

          if (uniquenessConstraintName) {
            uniquenessSets
              .find(v => v.name === uniquenessConstraintName)
              .values.push(resultValue2)
          }

          generatorValues.push(resultValue2)
          contentElements.push(resultValue2)
        }
      }

      else if (contentElementPattern.test(elem[2]) || elem[2].length === 0) {
        contentElements.push(elem)
      }
    }

    result.push({
      name: i,
      elements: contentElements,
      lastMinute: lastMinute,
    })
  }

  return [result, generatorValues]
}

export function processSharedElementsGroups(originalStructure) {
  const sharedElementsGroups = []

  const renderDirectiveSymbol = '@'
  const renderGroupSymbol     = '\\+'
  const sharedOrderSymbol     = '\\?'

  const maybeRenderDirective    = `(?:${namePattern}${renderGroupSymbol})?(?:(?:([a-zA-Z]+),.*?)?${renderDirectiveSymbol})*$`
  const maybeSharedOrderPattern = `${namePattern}${sharedOrderSymbol}${sharedOrderSymbol}?`

  const namedSetPattern   = new RegExp(`^\\^(${namePattern})!!?(?:${maybeSharedOrderPattern}|${maybeRenderDirective})?$`)
  const lastMinutePattern = new RegExp(`^\\^.*!!`)

  for (const elem of originalStructure.flat()) {

    let patternResult

    if (patternResult = elem[2].match(namedSetPattern)) {

      const correspondingNumberedSet = elem[0]

      if (!sharedElementsGroups.find(v => v.name === patternResult[1])) {
        sharedElementsGroups.push({
          name: patternResult[1],
          lastMinute: false,
          sets: [correspondingNumberedSet]
        })
      }

      else {
        sharedElementsGroups.find(v => v.name === patternResult[1])
          .sets.push(correspondingNumberedSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        sharedElementsGroups.find(v => v.name === patternResult[1])
          .lastMinute = true
      }
    }
  }

  return sharedElementsGroups
}

export function processSharedOrderGroups(originalStructure) {
  const sharedOrderGroups = []

  const maybeNamedSetPattern = `(?:(${namePattern})!!?|!!?)?`
  const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}(${namePattern})\\?\\??$`
  const lastMinutePattern    = new RegExp('\\?\\?$')

  for (const elem of originalStructure.flat()) {

    let patternResult
    if (patternResult = new RegExp(sharedOrderPattern).exec(elem[2])) {

      const correspondingSet     = patternResult[1] || elem[0]
      const sharedOrderGroupName = patternResult[2]

      if (!sharedOrderGroups.find(v => v.name === sharedOrderGroupName)) {
        sharedOrderGroups.push({
          name: sharedOrderGroupName,
          sets: [correspondingSet],
          // dictator: false, // I think this should be calculated at a later stage
        })
      }

      else {
        sharedOrderGroups
          .find(sog => sog.name === sharedOrderGroupName)
          .sets
          .push(correspondingSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        sharedOrderGroups
          .find(sog => sog.name === sharedOrderGroupName)
          .lastMinute = true
      }
    }
  }

  return sharedOrderGroups
}

function indexProcessor(sharedElementsGroups) {

  const absolutePositionRegex        = new RegExp('^\\d+$')
  const absolutePositionFromEndRegex = new RegExp('^n(-\\d+)?$')
  const relativePositionRegex        = new RegExp('^((?:\\+|-)\\d+)$')

  const processPositionIndex = function(index) {
    let patternResult

    if (!index) {
      return null
    }
    else if (patternResult = index.toString().match(relativePositionRegex)) {
      return Number(patternResult[1])
    }

    else if (patternResult = index.toString().match(absolutePositionFromEndRegex)) {
      return Number(patternResult[1])
    }

    else if (patternResult = index.toString().match(absolutePositionRegex)) {
      return Number(index)
    }
  }

  const processSetIndex = function(index, currentIndex, elemCount) {
    let patternResult

    if (patternResult = index.toString().match(relativePositionRegex)) {
      const result = currentIndex + Number(patternResult[1])
      return result < 0
        ? null
        : elemCount < result
          ? null
          : [result]
    }

    else if (patternResult = index.toString().match(absolutePositionFromEndRegex)) {
      const result = elemCount - (Number(patternResult[1]) || 0) - 1
      return result < 0
        ? null
        : [result]
    }

    else if (patternResult = index.toString().match(absolutePositionRegex)) {
      const result = Number(index)
      return elemCount < result
        ? null
        : [result]
    }

    else {
      // named set
      const foundSeg = sharedElementsGroups.find(seg => seg.name === index)

      return foundSeg ? foundSeg.sets : []
    }
  }

  return {
    processSetIndex: processSetIndex,
    processPositionIndex: processPositionIndex,
  }
}

export function processCommands(originalStructure, numberedSets, sharedElementsGroups) {
  const result = []

  const idxPattern      = `(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|${namePattern})`

  const positionSymbol  = ':'
  const positionPattern = `${positionSymbol}(n(?:-\\d+)?|-\\d|\\d+)`

  const amountPattern   = '(\\d+)'

  // (^^=^), 0 args: current set, 999 elements
  // (^^n=^), 1 args: set n, 999 elements
  // (^^n,m=^), 2 args: set n, m elements
  const copySymbol    = '='
  const moveSymbol    = '\\~'
  const deleteSymbol  = '\\%'

  const mainRegex = new RegExp(
    `^\\^` +
    `(?:` +
    `${idxPattern}(?:${positionPattern})?` + // fromPosition
    `(?:` +
    `,${amountPattern}` +
    `(?:` +
    `,${idxPattern}(?:${positionPattern})?` + // toPosition
    `)?` +
    `)?` +
    `)?` +
    `(?:(${copySymbol})|(${moveSymbol})|(${deleteSymbol}))$`
  )

  for (const set of originalStructure) {

    for (const elem of set) {

      let patternResult

      // pr[0]: all, pr[1]: fromIdx, pr[2]: fromPos, pr[3]: amount,
      // pr[4]: toIdx, pr[5]: toPos,
      // pr[6]: copySymbol, pr[7]: moveSymbol, pr[8]: deleteSymbol
      if (patternResult = elem[2].match(mainRegex)) {

        const cmdName = patternResult[6]
          ? 'c'
          : patternResult[7]
            ? 'm'
            : patternResult[8]
              ? 'd'
              : ''

        const ip = indexProcessor(sharedElementsGroups)

        // is converted to a single numbered list in here
        const toSetName = ip.processSetIndex(
          patternResult[4] || elem[0],
          elem[0],
          originalStructure.length,
        )

        const toSetPosition = patternResult[5] // take defined value if defined
          ? ip.processSetIndex(patternResult[5])
          : patternResult[4] // otherwise take 0, if you defined a toSetName
            ? 0
            : numberedSets // otherwise, calculate its position in context of its idx
                           // using the the numbered sets
              .find(v => v.name === toSetName[0])
              .elements
              .reduce((accu, v) => v[1] < elem[1]
                ? accu + 1
                : accu, 0
              )

        const [toSetNameNew, toSetPositionNew] = numberedSets
          .filter(v => toSetName.includes(v.name))
          .reduce((accu, sl, i, arr) => {
            return accu[1] - (sl.elements.length + 1) < 0
              ? [accu[0] || sl.name, accu[1]]
              : [null, accu[1] - (sl.elements.length + 1)]
          }, [null, toSetPosition])

        // will stay a list -> is further computed
        // in applyCommand
        const fromSetName = ip.processSetIndex(
          patternResult[1] || toSetName,
          elem[0],
          originalStructure.length,
        )

        const fromSetPosition = ip.processPositionIndex(patternResult[2]) || 0
        const fromSetAmount   = /\d/.test(patternResult[3])
          ? Number(patternResult[3])
          : 999

        if (
          fromSetName !== null &&
          toSetNameNew !== null &&
          fromSetAmount > 0
        ) {

          result.push([
            fromSetName,
            fromSetPosition,
            fromSetAmount,
            cmdName,
            toSetNameNew,
            toSetPositionNew,
          ])
        }
      }
    }
  }

  return result
}

export function processRenderDirectives(originalStructure, sharedElementsGroups) {
  const renderDirectives = []

  const namedSetSymbol        = '!'
  const renderGroupSymbol     = '\\+'
  const renderDirectiveSymbol = '@'

  const namedSetPattern = `(${namePattern})${namedSetSymbol}`
  const renderGroupPattern = `(${namePattern})${renderGroupSymbol}`
  const renderDirectivePattern = `^\\^(?:(?:(${namePattern})${namedSetSymbol})?(${namePattern})${renderGroupSymbol})?((?:(?:[a-zA-Z]+,.*?)?${renderDirectiveSymbol})*)$`

  const renderGroups      = []
  const renderAssignments = []

  for (const [i, set] of originalStructure.entries()) {

    renderDirectives.push({
      name: i,
      directives: {},
    })

    for (const elem of set) {

      let match
      if (match = elem[2].match(renderDirectivePattern)) {

        const namedSet    = match[1]
        const renderGroup = match[2]

        if (renderGroup) {
          if (!renderGroups.find(v => v.name === renderGroup)) {
            renderGroups.push({
              name: renderGroup,
              sets: []
            })
          }

          if (namedSet) {
            renderGroups
              .find(v => v.name === renderGroup)
              .sets
              .push(...sharedElementsGroups.find(v => v.name === namedSet).sets)
          }
          else {
            renderGroups
              .find(v => v.name === renderGroup)
              .sets
              .push(i)
          }
        }

        const renderStatements = match[3]
          .split('@')
          .slice(0, -1)

        if (renderStatements.length > 0) {
          renderAssignments.push({
            name: renderGroup || i,
            assignments: renderStatements
            .map(v => v.length > 0 ? [v.split(',', 1)[0], v.split(/^.*?,/)[1]] : ['display', 'none'])
          })
        }
      }
    }
  }

  // fill renderdirectives
  for (const assignment of renderAssignments
    .sort((a,_) => (typeof a.name === 'number') ? 1 : -1)
  ) {

    const effectiveAssignments = []

    for (const elem of assignment.assignments) {
      switch (elem[0]) {
        case 'openDelim':
        case 'od':
          effectiveAssignments.push({
            name: 'openDelim',
            value: elem[1],
          })
          break;

        case 'closeDelim':
        case 'cd':
          effectiveAssignments.push({
            name: 'closeDelim',
            value: elem[1],
          })
          break;

        case 'fieldSeparator':
        case 'fs':
          effectiveAssignments.push({
            name: 'fieldSeparator',
            value: elem[1],
          })
          break;

        case 'fieldPadding':
        case 'fp':

          const theValue = Number(elem[1])

          if (!Number.isNaN(theValue)) {
            effectiveAssignments.push({
              name: 'fieldPadding',
              value: theValue,
            })
          }
          break;

        case 'colors':
        case 'clrs':
          effectiveAssignments.push({
            name: 'colors',
            value: elem[1].split(','),
          })
          break;

        case 'display':
          effectiveAssignments.push({
            name: 'display',
            value: elem[1]
          })
          break;
      }
    }

    const executeAssignment = function(name, values) {
      switch (typeof name) {

        case 'number':
          for (const v of values) {
            renderDirectives.find(v => v.name === name).directives[v.name] = v.value
          }
          break;

        case 'string':
          for (const set of renderGroups.find(v => v.name === name).sets) {
            executeAssignment(set, values)
          }
          break;
      }
    }

    executeAssignment(assignment.name, effectiveAssignments)
  }

  return renderDirectives
}
