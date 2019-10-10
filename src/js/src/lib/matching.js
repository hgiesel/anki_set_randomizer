import {
  compareArrays,
} from './util.js'

export function matchStructures(elementsInherited, elementsOriginal) {
  const result = []

  for (const setInherited of elementsInherited) {

    let match
    if (match = elementsOriginal.find(set =>
      compareArrays(set.map(v => v[3]), setInherited.map(v => v[3]))
      // Don't make n-to-m mappings, only 1-to-1:
      && !result.find(v => v.to[0] === set[0][0] && v.to[1] === set[0][1])
    )) {

      console.log('lala', setInherited, match)

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

// modifies generatedValues by pushing rematches
export function matchGeneratedValues(structureMatches, generatedValuesInherited) {
  const result = []

  for (const value of generatedValuesInherited) {
    const match = structureMatches.find(v => compareArrays(v.from.slice(0, 2), value.slice(0, 2)))

    if (match) {
      result.push([...match.to, value[2], value[3]])
    }
  }
  return generatedValuesInherited.concat(result)
}

function complementArrays(elems1, elems2) {
  const result = []

  for (const e of elems1) {
    result.push(e)
  }

  for (const e of elems2) {
    if (!result.includes(e)) {
      result.push(e)
    }
  }

  return result
}

export function matchSetReorder(structureMatches, inheritedReorders, reorders) {
  const modifiedReorders = []

  for (const reorder of reorders) {
    let match, reorderInherited

    // named sets
    if ((typeof reorder.name === 'string') && (match = inheritedReorders.find(v => reorder.name === v.name))) {

      modifiedReorders.push({
        iter: reorder.iter,
        name: reorder.name,
        length: reorder.length,
        sets: reorder.sets,
        setLengths: reorder.setLengths,
        order: complementArrays(match.order, reorder.order),
        lastMinute: reorder.lastMinute,
      })
    }

    // numbered sets
    else if (
      (match = structureMatches.find(m => reorder.iter === m.to[0] && reorder.name === m.to[1])) &&
      (reorderInherited = inheritedReorders.find(reo => reo.iter === match.from[0] && reo.name === match.from[1]))
    ) {
      modifiedReorders.push({
        iter: reorder.iter,
        name: reorder.name,
        length: reorder.length,
        sets: reorder.sets,
        setLengths: reorder.setLengths,
        order: reorderInherited.order,
        lastMinute: reorder.lastMinute,
      })
    }

    // new sets
    else {
      modifiedReorders.push(reorder)
    }
  }

  return modifiedReorders
}

// important for collective color indexing
export function reorderForRendering(structureMatches, reorderings, iterIndex) {

  const resultMatched = []
  const resultNew = []

  for (const [i, ro] of reorderings
    .map((v, j) => ({rendering: v, order: j}))
    .entries()
  ) {

    console.log('ro', ro)

    const match = structureMatches
      .find(v =>
        iterIndex === v.to[0] &&
        i === v.to[1])

    if (match) {
      resultMatched.splice(match.from[1], 0, ro)
    }
    else {
      resultNew.push(ro)
    }
  }

  console.log('reo1', reorderings)
  console.log('reo2', resultMatched.filter(v => v).concat(resultNew))

  return resultMatched.filter(v => v).concat(resultNew)
}
