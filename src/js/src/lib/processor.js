function generateRandomValue(min, max) {
  return Math.random() * (max - min) + min
}

const namePattern = '[a-zA-Z_]\\w*'

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

  const lastMinutePattern = new RegExp('^\\^!!?$')

  const generatorSymbol            = '#'
  const uniquenessConstraintSymbol = '\\$'

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`

  const realIntGenerator           = `${realOrIntPattern},${realOrIntPattern}(?:,${intPattern})?`
  const realIntGeneratorWithGroups = `(${realOrIntPattern}),(${realOrIntPattern})(?:,(${intPattern}))?`

  const generatorPattern = `^\\^(?:${namePattern}${uniquenessConstraintSymbol})?(${realIntGenerator}|${namePattern})${generatorSymbol}$`
  const uniquenessSetRegex = `^\\^(${namePattern})${uniquenessConstraintSymbol}`

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
      else if (patternResult = new RegExp(generatorPattern, 'gm').exec(elem[2])) {

        const uniquenessConstraintMatch = patternResult[0].match(RegExp(uniquenessSetRegex))

        let uniquenessConstraintName
        if (uniquenessConstraintMatch) {
          uniquenessConstraintName = uniquenessConstraintMatch[1]
        }

        if (!uniquenessSets.find(v => v.name === uniquenessConstraintName)) {
          uniquenessSets.push({
            name: uniquenessConstraintName,
            values: []
          })
        }

        const setIndex  = elem[0]
        const elemIndex = elem[1]

        let resultValue2

        const maybePregeneratedValue = preGeneratedValues
          .find(v => v[0] === setIndex && v[1] === elemIndex)

        if (maybePregeneratedValue) {
          resultValue2 = maybePregeneratedValue
        }

        else {

          if (/^\d/.test(patternResult[1])) {
            // generate a random integer or real number
            const intOrValueGenerator = patternResult[1].match(RegExp(realIntGeneratorWithGroups))

            const minValue   = intOrValueGenerator[1]
            const maxValue   = intOrValueGenerator[2]
            const extraValue = intOrValueGenerator[3]

            const isReal      = minValue.includes('.') || maxValue.includes('.')

            let uniqueValueFound = false
            let resultValue

            let countIdx = 0
            const countIdxMax = 1000

            while (!uniqueValueFound && countIdx < countIdxMax) {

              const preValue = generateRandomValue(
                Number(minValue),
                Number(maxValue),
              )

              resultValue = isReal
                ? preValue.toFixed(extraValue || 2)
                : (Math.round(preValue) * (extraValue || 1)).toString()

              if (uniquenessConstraintName) {
                if (!uniquenessSets
                  .find(v => v.name === uniquenessConstraintName)
                  .values.includes(resultValue)
                ) {
                  uniqueValueFound = true
                }
              }

              countIdx++
            }

            if (countIdx < countIdxMax) {
              resultValue2 = [setIndex, elemIndex, resultValue]
            }
          }

          else {
            // generate string from generator set
            const text = patternResult[1]
            const foundGeneratorSet = generatorSets.find(v => v.name === text)

            if (foundGeneratorSet) {

              let resultValue

              let uniqueValueFound = false
              let countIdx = 0
              const countIdxMax = 1000

              while (!uniqueValueFound && countIdx < countIdxMax) {
                const idx         = Math.floor(Math.random() * foundGeneratorSet.elements.length)
                resultValue = foundGeneratorSet.elements[idx]

                if (uniquenessConstraintName) {
                  if (!uniquenessSets
                    .find(v => v.name === uniquenessConstraintName)
                    .values.includes(resultValue)
                  ) {
                    uniqueValueFound = true
                  }
                }

                countIdx++
              }

              if (countIdx < countIdxMax) {
                resultValue2 = [setIndex, elemIndex, resultValue]
              }
            }
          }
        }
        // else -> no element can be generated
        // get resultValue2

        if (resultValue2) {
          if (uniquenessConstraintName) {
            uniquenessSets
              .find(v => v.name === uniquenessConstraintName)
              .values.push(resultValue2[2])
          }

          generatorValues.push(resultValue2)
          contentElements.push(resultValue2)
        }
      }

      else if (contentElementPattern.test(elem[2])) {
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

  const maybeRenderDirective    = `(?:${namePattern}${renderGroupSymbol})?(?:([a-zA-Z]+),.*?${renderDirectiveSymbol})*$`
  const maybeSharedOrderPattern = `${namePattern}${sharedOrderSymbol}${sharedOrderSymbol}`

  const namedSetPattern   = `^\\^(${namePattern})!!?(?:${maybeSharedOrderPattern}|${maybeRenderDirective})?$`
  const lastMinutePattern = new RegExp(`^\\^.*!!${maybeSharedOrderPattern}$`)

  for (const elem of originalStructure.flat()) {

    let patternResult

    if (patternResult = new RegExp(namedSetPattern).exec(elem[2])){

      const correspondingNumberedSet = elem[0]

      if (sharedElementsGroups.filter(v => v.name === patternResult[1]).length === 0) {
        sharedElementsGroups.push({
          name: patternResult[1],
          lastMinute: false,
          sets: [correspondingNumberedSet]
        })
      }

      else {
        sharedElementsGroups.filter(v => v.name === patternResult[1])[0].sets.push(correspondingNumberedSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        sharedElementsGroups.filter(v => v.name === patternResult[1])[0].lastMinute = true
      }
    }
  }

  return sharedElementsGroups
}

export function processSharedOrderGroups(originalStructure) {
  const sharedOrderGroups = []

  const maybeNamedSetPattern = `(?:(${namePattern})!!?)?`
  const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}(${namePattern})\\?$`
  const lastMinutePattern    = new RegExp('^\\^.*\\?\\?$')

  for (const elem of originalStructure.flat()) {

    let patternResult
    if (patternResult = new RegExp(sharedOrderPattern).exec(elem[2])) {

      const correspondingSet = patternResult[1] || elem[0]

      if (sharedOrderGroups.filter(v => v.name === patternResult[2]).length === 0) {
        sharedOrderGroups.push({
          name: patternResult[2],
          sets: [correspondingSet],
          // dictator: false, // I think this should be calculated at a later stage
        })
      }

      else {
        sharedOrderGroups.filter(sog => sog.name === patternResult[2])[0].sets.push(correspondingSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        sharedOrderGroups.filter(sog => sog.name === patternResult[1])[0].lastMinute = true
      }
    }
  }

  return sharedOrderGroups
}

function processIndex(index, currentIndex, elemCount) {
  const absolutePositionFromEndPattern  = '^n(-\\d+)?$'
  const absolutePosition                = '^\\d+$'
  const posiitveRelativePositionPattern = '^\\+(\\d+)$'
  const negativeRelativePositionPattern = '^-(\\d+)$'

  let patternResult

  if (patternResult = new RegExp(posiitveRelativePositionPattern).exec(index)) {
    return currentIndex + Number(patternResult[1])
  }
  else if (patternResult = new RegExp(negativeRelativePositionPattern).exec(index)) {
    return currentIndex - Number(patternResult[1])
  }

  else if (patternResult = new RegExp(absolutePositionFromEndPattern).exec(index)) {
    return elemCount - (Number(patternResult[1]) || 0) - 1
  }
  else if (patternResult = new RegExp(absolutePosition).exec(index)) {
    return Number(index)
  }
  else {
    return index
  }
}

export function processCommands(originalStructure) {
  const result = []

  const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|${namePattern})'
  const positionSymbol  = ':'
  const positionPattern = `(?:${positionSymbol}(\\d+|n(?:-\\d+)?))?`

  const amountPattern   = '(?:,(\\d+))?'

  const copySymbol    = '='
  const moveSymbol    = '\\~'
  const deleteSymbol  = '\\%'

  // (^^=^), 0 args: current set, 999 elements
  // (^^n=^), 1 args: set n, 999 elements
  // (^^n,m=^), 2 args: set n, m elements
  const copyPattern   = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${copySymbol}$`
  const movePattern   = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${moveSymbol}$`
  const deletePattern = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${deleteSymbol}$`

  for (const set of originalStructure) {
    for (const elem of set) {

      const toSetName     = elem[0]
      const toSetPosition = elem[1]

      let patternResult
      let commandType

      if (patternResult = new RegExp(copyPattern, 'gm').exec(elem[2])) {
        commandType = 'c'
      }
      else if (patternResult = new RegExp(movePattern, 'gm').exec(elem[2])) {
        commandType = 'm'
      }
      else if (patternResult = new RegExp(deletePattern, 'gm').exec(elem[2])) {
        commandType = 'd'
      }

      if (commandType) {
        const fromSetName     = processIndex(patternResult[1] || toSetName, toSetName, originalStructure.length)
        const fromSetPosition = processIndex(patternResult[2] || 0, toSetPosition, set.length)
        const fromSetAmount   = Number(patternResult[3]) || 999

        result.push([
          fromSetName,
          fromSetPosition,
          fromSetAmount,
          commandType,
          toSetName,
          toSetPosition,
        ])
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
  const renderDirectivePattern = `^\\^(?:(?:(${namePattern})${namedSetSymbol})?(${namePattern})${renderGroupSymbol})?((?:[a-zA-Z]+,.*?${renderDirectiveSymbol})*)$`

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
              .map(v => [v.split(',', 1)[0], v.split(/^.*?,/)[1]]),
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

          if (theValue) {
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
