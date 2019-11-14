import {
  compareArrays,
} from './randomize/util.js'

const getContent = function([/* iterName */, /* setIndex */, /* posIndex */, content]) {
  return content
}

const adaptForReorders = function(structureMatch) {
  return [structureMatch[0], String(structureMatch[1])]
}

export const structureMatcher = function(
  elementsOriginal,
  elementsOld,
  iterName,
) {
  const structureMatches = []

  for (const setInherited of elementsOld) {
    let match = null
    if (match = elementsOriginal
      .find(set => (
        compareArrays(set.map(getContent), setInherited.map(getContent))
        // Don't make n-to-m mappings, only 1-to-1:
        && !structureMatches.find(sm => compareArrays(sm.to.slice(0, 2), set[0].slice(0, 2)))
      ))) {
      const [
        fromIter,
        fromSet,
      ] = setInherited[0]

      const [
        toIter,
        toSet,
      ] = match[0]

      // inherited set moved FROM position TO new position
      // used to be found at FROM position, but now is found at TO position
      structureMatches.push({
        from: [fromIter, fromSet],
        to: [toIter, toSet],
      })
    }
  }

  const mergeElements = function() {
    return elementsOld
      .concat(elementsOriginal
        .filter(v => !structureMatches
          .find(w => w.to[0] === v[0][0] && w.to[1] === v[0][1])
        )
      )
  }

  // modifies generatedValues by pushing rematches
  const matchGeneratedValues = function(generatedValuesInherited) {
    const result = []

    for (const value of generatedValuesInherited) {
      const match = structureMatches
        .find(v => compareArrays(v.from, value.slice(0, 2)))

      if (match) {
        result.push([...match.to, value[2], value[3]])
      }
    }

    return generatedValuesInherited.concat(result)
  }

  const reorderMatcher = function(reordersOld) {
    const matchReorder = function(reorder) {
      const match = structureMatches
        .find(({to}) => compareArrays([reorder.iter, reorder.name], adaptForReorders(to)))

      const reorderOld = match
        // search if inherited numbered set
        ? reordersOld.find(({iter, name}) => compareArrays([iter, name], adaptForReorders(match.from)))
        : Number.isNaN(Number(reorder.name))
        // search if inherited named set
        ? reordersOld.find(({name}) => reorder.name === name)
        : null

      return reorderOld
        ? reorderOld.order
        : null
    }

    return {
      matchReorder: matchReorder,
    }
  }

  // important for collective color indexing
  const reorderForRendering = function(reorders) {
    const resultMatched = []
    const resultNew = []

    for (const [i, ro] of reorders
      .map((v, j) => ({rendering: v, order: j}))
      .entries()
    ) {
      const match = structureMatches
        .find(({to}) => compareArrays(to, [iterName, i]))

      if (match) {
        resultMatched.splice(match.from[1], 0, ro)
      }
      else {
        resultNew.push(ro)
      }
    }

    return resultMatched.filter(v => v).concat(resultNew)
  }

  return {
    matchGeneratedValues: matchGeneratedValues,
    reorderMatcher: reorderMatcher,
    reorderForRendering: reorderForRendering,
    mergeElements: mergeElements,
  }
}

export default structureMatcher
