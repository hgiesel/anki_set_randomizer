import {
  compareArrays,
} from './util.js'

export function matchStructures(elementsOriginal, elementsInherited) {
  const result = []

  for (const setInherited of elementsInherited) {

    let match
    if (match = elementsOriginal.find(set =>
      compareArrays(set.map(v => v[3]), setInherited.map(v => v[3]))
      // Don't make n-to-m mappings, only 1-to-1:
      && !result.find(v => v.to[0] === set[0][0] && v.to[1] === set[0][1])
    )) {

      // inherited set moved FROM position TO new position
      // used to be found at FROM position, but now is found at TO position
      result.push({
        from: setInherited[0].slice(0, 2),
        to: match[0].slice(0, 2),
      })

    }
  }

  return result
}

export function matchGeneratedValues(structureMatches, generatedValues) {
  const result = []

  for (const value of generatedValues) {
    const match = structureMatches.find(v => v.from[0] === value[0] && v.from[1] === value[1])

    if (match) {
      result.push([...match.to, value[2], value[3]])
    }
  }

  // return original generatedValues + rematchings
  return generatedValues.concat(result)
}

// important for collective color indexing
export function reorderForRendering(structureMatches, reorderings, iterIndex) {

  const result = Array(reorderings.length)

  for (const [i, ro] of reorderings
    .map((v, i) => ({
      rendering: v,
      order: i
    }))
    .entries()
  ) {

    const match = structureMatches.find(v => iterIndex === v.to[0] && i === v.to[1])

    if (match) {
      result[match.from[1]] = ro
    }
    else {
      result.push(ro)
    }
  }

  return result
    .filter(v => v !== undefined)
}
