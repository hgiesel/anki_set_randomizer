import {
  namePattern,
} from './util.js'

export function processCommands(originalStructure, numberedSets, sharedElementsGroups) {
  const result = []

  const idxRegex      = `(?:(\\d+)|((?:\\+|-)\\d+)|n(-\\d+)|(${namePattern}))`
  const positionRegex = ':(?:\\+?(\\d+)|n?(-\\d+))'

  const mainRegex = new RegExp(
    `^\\$(?:(c|copy)|(m|move)|(d|del|delete))\\(` +
    `(?:` +
    `(\\d+)` + // amount
    `(?:` +
    `\\s*,\\s*` +
    `${idxRegex}(?:${positionRegex})?` + // fromPosition
    `(?:` +
    `\\s*,\\s*` +
    `${idxRegex}(?:${positionRegex})?` + // toPosition
    `)?` +
    `)?` +
    `)?\\)$`
  )

  for (const elem of originalStructure.flat()) {
    const patternResult = elem[2]
      .match(mainRegex)

    // pr[1]: copySymbol, pr[2]: moveSymbol, pr[3]: deleteSymbol
    // pr[4]: amount
    // pr[5]: absIdx, pr[6]: relIdx, pr[7]: endIdx, pr[8]: nameIdx,
    // pr[9]: posIdx, pr[10]: negIdx,
    // pr[11]: absIdx, pr[12]: relIdx, pr[13]: endIdx, pr[14]: nameIdx,
    // pr[15]: posIdx, pr[16]: negIdx,
    if (patternResult) {

      const cmdName = patternResult[1]
        ? 'c'
        : patternResult[2]
        ? 'm'
        : patternResult[3]
        ? 'd'
        : ''

      const amount = patternResult[4]
        ? Number(patternResult[4])
        : 999

      // is converted to a single numbered list in here
      const [
        toSetName,
        toSetNameWasDefined,
      ] = processSetIndex(
        patternResult[11],
        patternResult[12],
        patternResult[13],
        patternResult[14],
        elem[0],
        originalStructure.length,
        sharedElementsGroups,
      )

      const toSetPosition = processPositionIndex(
        patternResult[15],
        patternResult[16],
        toSetNameWasDefined,
        toSetName[0] ? toSetName[0] : elem[0],
        numberedSets,
        elem[1],
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
      const [fromSetName, _] = processSetIndex(
        patternResult[5],
        patternResult[6],
        patternResult[7],
        patternResult[8],
        elem[0],
        originalStructure.length,
        sharedElementsGroups,
      )

      const fromSetPosition = processPositionIndex(
        patternResult[9],
        patternResult[10],
        true,
        elem[0],
        numberedSets,
        elem[1],
      )

      if (
        fromSetName !== null &&
        toSetNameNew !== null &&
        amount > 0
      ) {

        result.push([
          cmdName,
          amount,
          fromSetName,
          fromSetPosition,
          toSetNameNew,
          toSetPositionNew,
        ])
      }
    }
  }

  console.log(result)

  return result
}

function processSetIndex(
  absIndex,
  relIndex,
  endIndex,
  nameIndex,
  currentIndex,
  elemCount,
  sharedElementsGroups,
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
    const foundSeg = sharedElementsGroups
      .find(seg => seg.name === nameIndex)

    return foundSeg
      ? [foundSeg.sets, true]
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
      .reduce((accu, v) =>
        v[1] < inSetIdx
          ? accu + 1
          : accu,
        0
      )
  }
}
