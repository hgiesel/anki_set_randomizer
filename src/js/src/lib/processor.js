function generateRandomValue(min, max) {
  return Math.random() * (max - min) + min
}

// also processes generator patterns
export function processNumberedSets(originalStructure, preGeneratedValues) {
  const result          = []
  const generatorValues = []

  const lastMinutePattern = new RegExp('^\\^!!?$')

  const realMaybeInt     = '(\\d+(?:\\.\\d*)?)'
  const generatorSymbol  = '#'
  const generatorPattern = `^\\^${realMaybeInt},${realMaybeInt}(?:,(\\d+))?${generatorSymbol}$`

  const contentElementPattern = new RegExp('^[^\\^]')

  for (const [i, set] of originalStructure.entries()) {

    const contentElements = []
    let lastMinute = false

    for (const elem of set) {

      let patternResult

      if (lastMinutePattern.test(elem[2])) {
        lastMinute = true
      }
      else if (patternResult = new RegExp(generatorPattern, 'gm').exec(elem[2])) {
        const setIndex  = elem[0]
        const elemIndex = elem[1]

        let resultValue2

        const maybePregeneratedValue = preGeneratedValues
          .find(v => v[0] === setIndex && v[1] === elemIndex)

        if (maybePregeneratedValue) {
          resultValue2 = maybePregeneratedValue
        }

        else {
          const minValue   = patternResult[1]
          const maxValue   = patternResult[2]
          const extraValue = patternResult[3]

          const isReal      = minValue.includes('.') || maxValue.includes('.')
          const preValue    = generateRandomValue(Number(minValue), Number(maxValue))

          const resultValue  = isReal ? preValue.toFixed(extraValue || 2) : (Math.round(preValue) * (extraValue || 1)).toString()
          resultValue2 = [setIndex, elemIndex, resultValue]
        }

        generatorValues.push(resultValue2)
        contentElements.push(resultValue2)
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

  const maybeSharedOrderPattern = '(?:[a-zA-Z_][a-zA-Z0-9_]*\\?\\??)?'
  const namedSetPattern   = `^\\^([a-zA-Z_][a-zA-Z0-9_]*)!!?${maybeSharedOrderPattern}$`
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

  const maybeNamedSetPattern = '(?:([a-zA-Z_][a-zA-Z0-9_]*)!!?)?'
  const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}([a-zA-Z_][a-zA-Z0-9_]*)\\?$`
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

  const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|[a-zA-Z_][a-zA-Z0-9_]*)'

  const positionSymbol  = ':'
  const positionPattern = `(?:${positionSymbol}(\\d+|n(?:-\\d+)?))?`

  const amountPattern   = '(?:(\\d+))?'

  const copySymbol    = '='
  const copyPattern   = `^\\^${idxPattern}${positionPattern},${amountPattern}${copySymbol}$`

  const moveSymbol    = '\\~'
  const movePattern   = `^\\^${idxPattern}${positionPattern},${amountPattern}${moveSymbol}$`

  const deleteSymbol  = '\\%'
  const deletePattern = `^\\^${amountPattern}${deleteSymbol}$`

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

      if (commandType === 'c' || commandType === 'm') {
        const fromSetName     = processIndex(patternResult[1], toSetName, originalStructure.length)
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
      else if (commandType === 'd') {
        const fromSetName     = toSetName
        const fromSetPosition = toSetPosition
        const fromSetAmount   = Number(patternResult[1]) || 999

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
