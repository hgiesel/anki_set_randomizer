import {
  compareArrays,
} from './randomize/util.js'

const getContent = function([/* iterName */, /* setIndex */, /* posIndex */, content]) {
  return content
}

const adaptForShuffles = function([iterName, setId]) {
  return [iterName, String(setId)]
}

export const structureMatcher = function(
  elements,
  elementsOld,
  iterName,
) {
  const structureMatches = []

  for (const setInherited of elementsOld) {
    let match = null
    if (match = elements
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

  console.log(iterName, structureMatches)

  const exportElements = function() {
    return elements.concat(elementsOld
      .filter(elem => !structureMatches
        .find(sm => compareArrays(sm.from, elem[0].slice(0, 2)))
      ))
  }

  const mergeShuffles = function(shuffles, shufflesOld) {
    const result = shuffles.concat(shufflesOld
      .filter(({iter, name}) => !structureMatches
        .find(sm => compareArrays(adaptForShuffles(sm.from), [iter, name]))
      ))

    return result
  }

  // modifies generatedValues by pushing rematches
  const matchGeneratedValues = function(generatedValuesOld) {
    const result = generatedValuesOld.map((value) => {
      const match = structureMatches
        .find(v => compareArrays(v.from, value.slice(0, 2)))

      return match
        ? [...match.to, value[2], value[3]]
        : value
    })

    return result
  }

  const matchShuffles = function(shufflesOld, setToShufflesMap) {
    const matchReorder = function(shuffle) {
      const match /*
      a structure match that maps to the new shuffle location
      */ = structureMatches
        .find(({to}) => {
          const [toIter, toSet] = to
          return compareArrays([shuffle.iter, shuffle.name], adaptForShuffles([toIter, setToShufflesMap[toIter][toSet]]))
        })

      const shuffleOld /*
      an old shuffle that is mapped to by the found structure match
      */ = match
        // search if inherited numbered set
        ? shufflesOld.find(({iter, name}) => {
          const [matchIter, matchSet] = match.from
          return compareArrays([iter, name], adaptForShuffles([matchIter, setToShufflesMap[matchIter][matchSet]]))
        })
        : Number.isNaN(Number(shuffle.name))
        // search if inherited named set
        ? shufflesOld.find(({name}) => shuffle.name === name)
        : null

      return shuffleOld
        ? shuffleOld.shuffle
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
    matchShuffles: matchShuffles,
    reorderForRendering: reorderForRendering,
    exportElements: exportElements,
    mergeShuffles: mergeShuffles,
  }
}

export default structureMatcher
