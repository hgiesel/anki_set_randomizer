export const compareArrays = function(array, otherArray) {
  if (!otherArray || array.length !== otherArray.length) {
    return false
  }

  for (let i = 0, l = array.length; i < l; i++) {
    // Check if we have nested arrays
    if (array[i] instanceof Array && otherArray[i] instanceof Array) {
      // recurse into the nested arrays
      if (!compareArrays(array[i], otherArray[i])) {
        return false
      }
    }
    else if (array[i] !== otherArray[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false
    }
  }
  return true
}

export const getLengths = function(ns, elements) {
  const setLengths = ns.sets.map(set => elements[set].length)
  const length = setLengths.reduce((accu, setLength) => accu + setLength, 0)

  return [
    length,
    setLengths,
  ]
}
