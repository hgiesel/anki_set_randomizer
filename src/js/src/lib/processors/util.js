export const namePattern = '[a-zA-Z_]\\w*'

export function getCorrespondingSets(
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
