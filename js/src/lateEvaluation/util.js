export function partitionList(list, spacing) {
    const output = []

    for (let i = 0; i < list.length; i += spacing) {
        output[output.length] = list.slice(i, i + spacing)
    }

    return output
}

// evaluates named set args in $n(), $o(), or $a()
export function getCorrespondingSets(
  elements,
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
    correspondingSets = [elements.length + offset - 1]
  }
  else if (relativePos) {
    const idx = currentPos + Number(relativePos)

    correspondingSets = elements[idx]
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
        : elements.length + Number(otherNamedSetPos) - 1

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
