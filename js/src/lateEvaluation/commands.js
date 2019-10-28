export function processCommand(
  namedSets, elementLength,
  copySymbol, moveSymbol, deleteSymbol, amount,
  fromAbsIdx, fromRelIdx, fromEndIdx, fromNameIdx, fromPosIdx, fromNegIdx,
  toAbsIdx, toRelIdx, toEndIdx, toNameIdx, toPosIdx, toNegIdx
) {

  const cmdName = copySymbol
    ? 'c'
    : moveSymbol
    ? 'm'
    : deleteSymbol
    ? 'd'
    : ''

  const theAmount = amount
    ? Number(amount)
    : 999

  // is converted to a single numbered list in here
  const [
    toSetName,
    toSetNameWasDefined,
  ] = processSetIndex(
    toAbsIdx,
    toRelIdx,
    toEndIdx,
    toNameIdx,
    setIndex,
    elementLength,
    namedSets,
  )

  const toSetPosition = processPositionIndex(
    toPosIdx,
    toNegIdx,
    toSetNameWasDefined,
    toSetName[0] ? toSetName[0] : setIndex,
    numberedSets,
    elemIndex,
  )

  const [toSetNameNew, toSetPositionNew] = numberedSets
    .filter(v => toSetName.includes(v.name))
    .reduce((accu, sl) => {
      return accu[1] - (sl.elements.length + 1) < 0
        ? [accu[0] || sl.name, accu[1]]
        : [null, accu[1] - (sl.elements.length + 1)]
    }, [null, toSetPosition])

  // will stay a list -> is further computed
  // in applyCommand
  const [fromSetName, _1] = processSetIndex(
    fromAbsIdx,
    fromRelIdx,
    fromEndIdx,
    fromNameIdx,
    setIndex,
    elementLength,
    namedSets,
  )

  const fromSetPosition = processPositionIndex(
    fromPosIdx,
    fromNegIdx,
    true,
    setIndex,
    numberedSets,
    elemIndex,
  )

  if (
    fromSetName !== null &&
    toSetNameNew !== null &&
    amount > 0
  ) {

    const result = [
      cmdName,
      amount,
      fromSetName,
      fromSetPosition,
      toSetNameNew,
      toSetPositionNew,
    ]

    return [result]
  }

  return []
}

function processSetIndex(
  absIndex,
  relIndex,
  endIndex,
  nameIndex,
  currentIndex,
  elemCount,
  namedSets,
) {

  if (absIndex) /* absolute index */ {
    const result = Number(absIndex)
    return elemCount <= result
      ? [[], true]
      : [[result], true]
  }

  else if (relIndex) /* relative index */ {
    const result = currentIndex + Number(relIndex)
    return result < 0
      ? [[], true]
      : elemCount < result
      ? [[], true]
      : [[result], true]
  }

  else if (endIndex) /* from end index */ {
    const result = elemCount + (Number(endIndex) - 1)
    return result < 0
      ? [[], true]
      : [[result], true]
  }

  else if (nameIndex) /* named set */ {
    // named set, I don't need to check name constraints
    // because, you only refer to named sets, not create them
    const foundNs = namedSets
      .find(ns => ns.name === nameIndex)

    return foundNs
      ? [foundNs.sets, true]
      : [[], true]
  }

  else {
    return [[currentIndex], false]
  }
}

const processPositionIndex = function(
  absIndex,
  negIndex,
  setNameWasDefined,
  setName,
  numberedSets,
  inSetIdx,
) {

  if (absIndex !== undefined) {
    return absIndex
  }
  else if (negIndex !== undefined) {
    return negIndex
  }
  else if (setNameWasDefined) {
    return 0
  }

  else {
    // otherwise, calculate its position in context of its idx
    // using the numbered sets
    return numberedSets
      .find(v => v.name === setName)
      .elements
      .reduce((accu, v) => {
        const elemIndex = v[2]

        return elemIndex < inSetIdx
          ? accu + 1
          : accu
      }, 0)
  }
}
