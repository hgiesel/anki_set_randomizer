export function processNumberedSets(originalStructure) {
  const numberedSets = []

  const lastMinutePattern     = new RegExp('^\\^!!?$')
  const contentElementPattern = new RegExp('^[^\\^]')

  for (const [i, set] of originalStructure.entries()) {

    const contentElements = []
    let lastMinute = false

    for (const elem of set) {

      let patternResult

      if (lastMinutePattern.test(elem[2])) {
        lastMinute = true
      }

      else if (contentElementPattern.test(elem[2])) {
        contentElements.push(elem)
      }
    }

    numberedSets.push({
      name: i,
      elements: contentElements,
      lastMinute: lastMinute,
    })
  }

  return numberedSets
}

export function processElementSharingSets(originalStructure) {
  const elementSharingSets = []

  const maybeSharedOrderPattern = '(?:[a-zA-Z]+\\?\\??)?'
  const namedSetPattern   = `^\\^([a-zA-Z]+)!!?${maybeSharedOrderPattern}$`
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

  const maybeNamedSetPattern = '(?:([a-zA-Z]+)!!?)?'
  const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}([a-zA-Z]+)\\?$`
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

  const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|[a-zA-Z]+)'
  const positionPattern = '(?::(\\d+|n(?:-\\d+)?))?'
  const amountPattern   = '(?:(\\d+))?'

  const copySymbol    = '='
  const copyPattern   = `^\\^${idxPattern}${positionPattern}${copySymbol}${amountPattern}$`

  const moveSymbol    = '\\~'
  const movePattern   = `^\\^${idxPattern}${positionPattern}${moveSymbol}${amountPattern}$`

  const deleteSymbol  = '%'
  const deletePattern = `^\\^${idxPattern}${positionPattern}${deleteSymbol}${amountPattern}$`

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
        const fromSetName     = processIndex(patternResult[1], toSetName, originalStructure.length)
        const fromSetPosition = processIndex(patternResult[2] || 0, toSetPosition, set.length)
        const fromSetAmount   = Number(patternResult[3]) || 999
        result.push([toSetName, toSetPosition, commandType, fromSetName, fromSetPosition, fromSetAmount])
      }
    }
  }

  return result
}
