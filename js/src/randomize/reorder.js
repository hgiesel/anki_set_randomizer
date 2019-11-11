const sortWithIndices = function(elems, indices) {
  const result = []

  for (const idx of indices) {
    const maybeElem = elems[idx]

    if (maybeElem) {
      result.push(maybeElem)
    }
  }

  if (indices.length < elems.length) {
    for (const idx of Array.from(new Array(elems.length - indices.length), (x, i) => i + indices.length)) {
      result.push(elems[idx])
    }
  }

  return result
}

const sliceWithLengths = function(elems, lengths) {
  const result = []

  let startIndex = 0
  for (const l of lengths) {
    result.push(elems.slice(startIndex, startIndex + l))
    startIndex += l
  }

  return result
}

const sortByLengthAndName = function(a, b) {
  // long sets first
  if (a.sets.length > b.sets.length) {
    return -1
  }

  else if (a.sets.length < b.sets.length) {
    return 1
  }

  // if same length:
  // * named sets have preference over numbered
  else if (Number.isNaN(Number(a.name))) {
    return -1
  }

  else {
    return 1
  }
}

export const applyReorders = function(reorders, elementsUnapplied) {
  // sort by size of sets to be reordered
  const reordersSorted = reorders.slice(0).sort(sortByLengthAndName)
  const reordersApplied = []
  const elements = elementsUnapplied.slice(0)

  for (const reo of reordersSorted) {
    const alreadySorted = reordersApplied.reduce((accu, reoApplied) => (
      accu || reo.sets.every(set => reoApplied.sets.some(w => w === set))
    ), false)

    if (!alreadySorted) {
      const flatSaveElems = reo
        .sets
        .map(setIndex => elements[setIndex])
        .flat()

      const mixedAndSliced = sliceWithLengths(
        sortWithIndices(flatSaveElems, reo.order),
        reo.setLengths,
      )

      mixedAndSliced.forEach((mixedSet, setIndex) => {
        elements[reo.sets[setIndex]] = mixedSet
      })

      reordersApplied.push(reo)
    }
  }

  return [reordersApplied, elements]
}

export default applyReorders
