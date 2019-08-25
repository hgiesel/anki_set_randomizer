function compareArrays(array, otherArray) {
  if (!otherArray || array.length !== otherArray.length) {
    return false
  }

  for (let i = 0, l=array.length; i < l; i++) {
    // Check if we have nested arrays
    if (array[i] instanceof Array && otherArray[i] instanceof Array) {
      // recurse into the nested arrays
      if (!compareArrays(array[i], otherArray[i])) {
        return false
      }
    }
    else if (array[i] != otherArray[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false
    }
  }
  return true
}

export function matchStructures(originalStructure, inheritedOriginalStructure) {
  const result = []

  for (const set of originalStructure) {
    for (const inheritedSet of inheritedOriginalStructure) {

      if (compareArrays(set.map(v => v[2]), inheritedSet.map(v => v[2]))
        // Don't make n-to-m mappings, only 1-to-1:
        && !result.find(v => v.from === inheritedSet[0][0])
        && !result.find(v => v.to === set[0][0])) {

        result.push({
          from: inheritedSet[0][0],
          to: set[0][0],
        })
      }
    }
  }

  return result
}

export function matchGeneratorValues(structureMatches, generatorValues) {
  const result = []

  for (const value of generatorValues) {
    const match = structureMatches.find(v => v.from === value[0])

    if (match) {
      result.push([match.to, value[1], value[2]])
    }
  }

  return result
}

// important for collective color indexing
export function reorderForRendering(structureMatches, reorderings) {

  const result = Array(reorderings.length)

  for (const [i, ro] of reorderings
    .map((v, i) => ({
      rendering: v,
      order: i
    }))
    .entries()
  ) {

    const match = structureMatches.find(v => i === v.to)

    if (match) {
      result[match.from] = ro
    }
    else {
      result.push(ro)
    }
  }

  return result
    .filter(v => v !== undefined)
}
