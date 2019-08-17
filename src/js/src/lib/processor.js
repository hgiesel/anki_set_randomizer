function generateRandomValue(min, max) {
  return Math.random() * (max - min) + min
}

// also processes generator patterns
export function processNumberedSets(originalStructure, preGeneratedValues) {
  const result          = []
  const generatorValues = []

  // get generatorSets
  const generatorSetPattern = new RegExp('^\\^([a-zA-Z_]\\w*)\\[(.*)\\]$')
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

  const setGenerator     = '[a-zA-Z_]\\w*'

  const generatorPattern = `^\\^(?:[a-zA-Z_]\\w*${uniquenessConstraintSymbol})?(${realIntGenerator}|${setGenerator})${generatorSymbol}$`
  const uniquenessSetRegex = `^\\^([a-zA-Z_]\\w*)${uniquenessConstraintSymbol}`

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

export function processElementSharingSets(originalStructure) {
  const elementSharingSets = []

  const maybeSharedOrderPattern = '(?:[a-zA-Z_]\\w*\\?\\??)?'
  const namedSetPattern   = `^\\^([a-zA-Z_]\\w*)!!?${maybeSharedOrderPattern}$`
  const lastMinutePattern = new RegExp(`^\\^.*!!${maybeSharedOrderPattern}$`)

  for (const elem of originalStructure.flat()) {

    let patternResult

    if (patternResult = new RegExp(namedSetPattern).exec(elem[2])){

      const correspondingNumberedSet = elem[0]

      if (elementSharingSets.filter(v => v.name === patternResult[1]).length === 0) {
        elementSharingSets.push({
          name: patternResult[1],
          lastMinute: false,
          sets: [correspondingNumberedSet]
        })
      }

      else {
        elementSharingSets.filter(v => v.name === patternResult[1])[0].sets.push(correspondingNumberedSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        elementSharingSets.filter(v => v.name === patternResult[1])[0].lastMinute = true
      }
    }
  }

  return elementSharingSets
}

export function processOrderSharingSets(originalStructure) {
  const orderSharingSets = []

  const maybeNamedSetPattern = '(?:([a-zA-Z_]\\w*)!!?)?'
  const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}([a-zA-Z_]\\w*)\\?$`
  const lastMinutePattern    = new RegExp('^\\^.*\\?\\?$')

  for (const elem of originalStructure.flat()) {

    let patternResult
    if (patternResult = new RegExp(sharedOrderPattern).exec(elem[2])) {

      const correspondingSet = patternResult[1] || elem[0]

      if (orderSharingSets.filter(v => v.name === patternResult[2]).length === 0) {
        orderSharingSets.push({
          name: patternResult[2],
          sets: [correspondingSet],
          // dictator: false, // I think this should be calculated at a later stage
        })
      }

      else {
        orderSharingSets.filter(v => v.name === patternResult[2])[0].sets.push(correspondingSet)
      }

      if (lastMinutePattern.test(elem[2])) {
        orderSharingSets.filter(v => v.name === patternResult[1])[0].lastMinute = true
      }
    }
  }

  return orderSharingSets
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

  const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|[a-zA-Z_]\\w*)'
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
