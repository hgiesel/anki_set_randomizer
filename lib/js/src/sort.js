export function sortByIndices(elems, indices) {
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

export function sliceWithLengths(elems, lengths) {
  const result = []

  let startIndex = 0
  for (const l of lengths) {
    result.push(elems.slice(startIndex, startIndex + l))
    startIndex += l
  }

  return result
}
