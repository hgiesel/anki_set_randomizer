import {
  getLengths,
} from './util.js'

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

const applyReorder = function(ns, elements, shuffler) {
  const flatSaveElems = ns
    .sets
    .map(setIndex => elements[setIndex])
    .flat()

  const [
    length,
    setLengths,
  ] = getLengths(ns, elements)

  const order = shuffler.shuffleFromNs(ns, length)

  const mixedAndSliced = sliceWithLengths(
    sortWithIndices(flatSaveElems, order),
    setLengths,
  )

  mixedAndSliced.forEach((mixedSet, setIndex) => {
    elements[ns.sets[setIndex]] = mixedSet
  })

  return {
    iter: ns.iter,
    name: ns.name,
    order: order,
  }
}

export const applyReorders = function(namedSets, elements, shuffler) {
  const reorders = []
  const namedSetsApplied = []

  // sort by size of sets to be reordered
  namedSets.sort(sortByLengthAndName)

  for (const ns of namedSets) {
    const alreadySorted = namedSetsApplied.reduce((accu, nsApplied) => (
      accu || ns.sets.every(set => nsApplied.sets.some(w => w === set))
    ), false)

    if (!alreadySorted) {
      namedSetsApplied.push(ns)
      reorders.push(applyReorder(ns, elements, shuffler))
    }
  }

  return reorders
}

export default applyReorders
