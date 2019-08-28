const namePattern = '[a-zA-Z_]\\w*'

function getCorrespondingSets(
  originalStructure,
  namedSets,
  absolutePos,
  absolutePosFromEnd,
  currentPos,
  relativePos,
  otherNamedSet,
  otherNamedSetPos,
) {
  let correspondingSets

  if (absolutePos) {
    correspondingSets = [Number(absolutePos)]
  }
  else if (absolutePosFromEnd) {
    const offset = Number(absolutePosFromEnd.slice(1))
    correspondingSets = [originalStructure.length + offset - 1]
  }
  else if (relativePos) {
    const idx = currentPos + Number(relativePos)

    correspondingSets = originalStructure[idx]
      ? [idx]
      : []
  }
  else if (otherNamedSet) {
    const foundSets = namedSets
      .find(v => v.name === otherNamedSet)

    const finalSets = foundSets
      ? foundSets.sets
      : []

    if (foundSets && otherNamedSetPos) {
      const idx = Number(otherNamedSetPos) >= 0
        ? Number(otherNamedSetPos)
        : originalStructure.length + Number(otherNamedSetPos) - 1

      correspondingSets = finalSets[idx] >= 0
        ? [finalSets[idx]]
        : []

    }
    else {
      correspondingSets = finalSets
    }
  }
  else /* self-referential */ {
    correspondingSets = [currentPos]
  }

  return correspondingSets
}

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
  const generatorSetPattern = new RegExp(
    `^\\^(?:generate|gen|g)\\(` +
    `(${namePattern})\\s*,\\s*` +
    `\\[((?:.|\\n|\\r)*)\\]` +
    `\\)`, 'm')

  const generatorTokens = '(?:\'((?:.|\\n|\\r)*?[^\\\\])\'|"((?:.|\\n|\\r)*?[^\\\\])")'
  const generatorSets   = []

  const singleQuotePattern = new RegExp(`\\\\'`, 'g')
  const doubleQuotePattern = new RegExp(`\\\\"`, 'g')
  const newLinePattern = new RegExp(`\\\\n`, 'g')
  const catchPattern = new RegExp(`\\\\.`, 'g')

  for (const elem of originalStructure.flat()) {
    let match

    if (match = elem[2].match(generatorSetPattern)) {

      const elements = []

      const generatorTokensRegex = new RegExp(generatorTokens, 'g')
      let contentMatch           = generatorTokensRegex.exec(elem[2])

      while (contentMatch) {
        if (contentMatch[1]) {
          elements.push(contentMatch[1]
            .replace(singleQuotePattern, "'")
            .replace(newLinePattern, '<br/>')
            .replace(catchPattern, (x) => x.slice(1))
          )
        }
        else if (contentMatch[2]) {
          elements.push(contentMatch[2]
            .replace(doubleQuotePattern, '"')
            .replace(newLinePattern, '<br/>')
            .replace(catchPattern, (x) => x.slice(1))
          )
        }

        contentMatch           = generatorTokensRegex.exec(elem[2])
      }

      generatorSets.push({
        name: match[1],
        elements: elements,
      })
    }
  }

  const lastMinutePattern = new RegExp(`^\\^(n|name)!\\(\\)$`)

  // const namePattern = '[a-zA-Z_]\\w*'

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
  const realIntGenerator =
    `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`

  const positionSymbol  = ':'
  const positionPattern = `(?:${positionSymbol}(n(?:-\\d+)?|-\\d|\\d+))?`

  const generatorSymbol = '#'
  const generatorPattern = new RegExp(
    `^\\^(?:pick|p)\\(` +
    `(?:${realIntGenerator}|` +
    `(${namePattern})${positionPattern})` +
    `(?:\\s*,\\s*(${namePattern}))?\\)` // uniqueness constraint
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

        const uniquenessConstraintName = patternResult[6]

        const minValue   = patternResult[1]
        const maxValue   = patternResult[2]
        const extraValue = patternResult[3]

        const generatorSetName  = patternResult[4]
        const generatorSetIndex = Number(patternResult[5])

        if (
          uniquenessConstraintName &&
          !uniquenessSets.find(v => v.name === uniquenessConstraintName)
        ) {
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
              .values.push(resultValue)
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

  const namedSetPattern = new RegExp(
    `\\^(?:name|n)(!)?` +
    `\\(` +
    `(${namePattern})` +
    `(?:` +
    `\\s*,\\s*` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  const sharedElementsGroups = []

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(namedSetPattern)])
    .filter(v => v[3])
    // sort self-referring sets to beginning
    .reduce((accu, v) => {
      v[3][3] || v[3][4] || v[3][5] || v[3][6] || v[3][7]
        ? accu.push(v)
        : accu.unshift(v)
      return accu
    }, [])
    .forEach(v => {
      const [
        _,
        isLastMinute,
        name,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[3]

      const correspondingSets = getCorrespondingSets(
        originalStructure,
        sharedElementsGroups,
        absolutePos,
        absolutePosFromEnd,
        v[0],
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      )

      let theSeg = sharedElementsGroups.find(v => v.name === name)

      if (!theSeg) {
        const idx = sharedElementsGroups.push({
          name: name,
          lastMinute: false,
          sets: []
        })

        theSeg = sharedElementsGroups[idx - 1]
      }

      theSeg.sets.push(...correspondingSets)
      theSeg.sets.sort()

      if (isLastMinute) {
        theSeg.lastMinute = true
      }
    })

  return sharedElementsGroups
}

export function processSharedOrderGroups(originalStructure, namedSets) {
  const sharedOrderGroups = []

  const sharedOrderPattern = new RegExp(
    `\\^(?:order|ord|o)(!)?` +
    `\\(` +
    `(${namePattern})` +
    `(?:` +
    `\\s*,\\s*` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(sharedOrderPattern)])
    .filter(v => v[3])
    .forEach(v => {
      const [
        _,
        isLastMinute,
        name,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[3]

      const correspondingSets = (otherNamedSet && !otherNamedSetPos)
        ? [otherNamedSet]
        : getCorrespondingSets(
          originalStructure,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )

      let theSog = sharedOrderGroups.find(v => v.name === name)

      if (!theSog) {
        const idx = sharedOrderGroups.push({
          name: name,
          lastMinute: false,
          sets: [],
          dictator: false, // will be determined at a later stage
        })

        theSog = sharedOrderGroups[idx - 1]
      }

      theSog.sets.push(...correspondingSets)
      theSog.sets.sort()

      if (isLastMinute) {
        theSog.lastMinute = true
      }
    })

  return sharedOrderGroups
}

export function processRenderDirectives(originalStructure, defaultStyle, namedSets) {

  const stylingDefinitions  = [
    {
      name: 'default',
      stylings: defaultStyle,
    },
    {
      name: 'none',
      stylings: {
        display: 'none',
      },
    },
    {
      name: 'block',
      stylings: {
        display: 'block',
        openDelim: '',
        closeDelim: '',
        fieldPadding: 0,
      },
    },
  ]

  const stylingDefinitionRegex = new RegExp(
    `^\\^(?:style|s)\\(` +
    `(${namePattern})` +
    `\\s*,\\s` +
    `(.*)` + // styling directives
    `\\)$`
  )

  const afterColonRegex = new RegExp(':(.*)$')

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(stylingDefinitionRegex)])
    .filter(v => v[3])
    .forEach(v => {

      const [
        _,
        name,
        stylingDirectives,
      ] = v[3]

      let sd = stylingDefinitions.find(v => v.name === name)

      if (!sd) {
        const idx = stylingDefinitions.push({
          name: name,
          stylings: {}
        })

        sd = stylingDefinitions[idx - 1]
      }

      stylingDirectives
        .split(',')
        .map(v => v.trim())
        .forEach(v => {

          if (v.startsWith('od:') || v.startsWith('openDelim:')) {
            sd.stylings['openDelim'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('cd:') || v.startsWith('closeDelim:')) {
            sd.stylings['closeDelim'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('fs:') || v.startsWith('fieldSeparator:')) {
            sd.stylings['fieldSeparator'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('fp:') || v.startsWith('fieldPadding:')) {
            const value = Number(v.match(afterColonRegex)[1])
            if (value >= 0) {
              sd.stylings['fieldPadding'] = value
            }
          }

          else if (v.startsWith('clrs:') || v.startsWith('colors:')) {
            const colors = v.match(afterColonRegex)[1].split(':')
            sd.stylings['colors'] = colors
          }
          else if (v.startsWith('ci:') || v.startsWith('collectiveIndexing:')) {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true'
              ? true
              : value === 'false'
                ? false
                : null

            if (typeof bool === 'boolean') {
              sd.stylings['collectiveIndexing'] = bool
            }
          }
          else if (v.startsWith('rsi:') || v.startsWith('randomStartIndex:')) {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true'
              ? true
              : value === 'false'
                ? false
                : null

            if (typeof bool === 'boolean') {
              sd.stylings['randomStartIndex'] = bool
            }
          }

          else if (v.startsWith('dp:') || v.startsWith('display:')) {
            sd.stylings['display'] = v.match(afterColonRegex)[1]
          }
        })
    })

  const stylingAssignments = []

  const stylingAssignmentRegex = new RegExp(
    `^\\^(?:apply|app|a)\\(` +
    `(${namePattern})` +
    `(?:\\s*,\\s` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(\\d+|n?-\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(stylingAssignmentRegex)])
    .filter(v => v[3])
    .forEach(v => {

      const [
        _,
        stylingName,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[3]

      if (stylingDefinitions.find(v => v.name === stylingName)) {
        const correspondingSets = getCorrespondingSets(
          originalStructure,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )

        correspondingSets
          .forEach(set => stylingAssignments[set] = stylingName)
      }
    })

  return [stylingDefinitions, stylingAssignments]
}
