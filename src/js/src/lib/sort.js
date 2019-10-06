// modifies in-place (!)
function rotate(arr, count) {
  count -= arr.length * Math.floor(count / arr.length)
  arr.push.apply(arr, arr.splice(0, count))
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

function sortWithIndices(elems, indices) {
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

function sliceWithLengths(elems, lengths) {
  const result = []

  let startIndex = 0
  for (const l of lengths) {
    result.push(elems.slice(startIndex, startIndex + l))
    startIndex += l
  }

  return result
}

export function applySetReorder(srs, elems) {
  // sort by size of sets to be reordered
  const sortedSrs = srs.slice(0).sort(
    (a, b) => {
      if (a.sets.length > b.sets.length) {
        return -1
      }
      else if (a.sets.length < b.sets.length) {
        return 1
      }
      else {
        if (typeof a.name === 'string') {
          return -1
        }
        else {
          return 1
        }
      }
    })

  const appliedSrs = []

  for (const sr of sortedSrs) {

    const alreadySorted = appliedSrs
      .reduce(
        (accu, v) => accu || sr.sets.every(srv => v.includes(srv)),
        false
      )

    if (!alreadySorted) {
      const flatSaveElems = sr
        .sets
        .map(v => elems[v[1]])
        .flat()

      sliceWithLengths(
        sortWithIndices(flatSaveElems, sr.order),
        sr.setLengths
      )
        .forEach((v, i) => {
          elems[sr.sets[i][1]] = v
        })

      appliedSrs.push(sr.sets)
    }
  }
}

export function applyInheritedSetReorder(reorders, inheritedReorders, structureMatches) {
  const modifiedReorders = []

  for (const reorder of reorders) {
    let match

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
    else if (match = structureMatches.find(v => reorder.iter === v.to[0] && reorder.name === v.to[1])) {
      const theReorder = inheritedReorders.find(v => v.iter === match.from[0] && v.name === match.from[1])

      modifiedReorders.push({
        iter: reorder.iter,
        name: reorder.name,
        length: theReorder.length,
        sets: theReorder.sets,
        setLengths: theReorder.setLengths,
        order: theReorder.order,
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

// values states include 'n', 'c', 'd'
// cmds states include 'c', 'd', 'm'
// cmd = [0:cmdType, 1: amount, 2:fromPosition, 3:fromAmount, 4:toSet, 5:toPosition]
export function applyCommands(cmds, elems) {
  const cmdType = 0

  cmds
    .sort((a, b) => {
      if (a[cmdType] === b[cmdType]) { return 0 }
      if (a[cmdType] === 'c') { return -1 }
      if (a[cmdType] === 'm' && b[cmdType] === 'd') { return -1 }
      if (a[cmdType] === 'm' && b[cmdType] === 'c') { return 1 }
      if (a[cmdType] === 'd') { return 1 }
    })
    .forEach(cmd => applyCommand(cmd, elems)) // modifies newElements
}

function applyCommand(cmd, elems) {

  const cmdName             = cmd[0]
  const fromSet             = cmd[2]
  const fromPosition        = cmd[3]
  const toSet               = cmd[4]
  const contentElementCount = cmd[5]

  let theElems

  switch (typeof fromSet) {
    case 'number':
      theElems = elems[fromSet]
      break

    // it's a list
    case 'object':
      theElems   = fromSet.flatMap(i => elems[i])
      break
  }


  // don't allow crazy positions indices
  if (
    theElems.length <= fromPosition ||
    fromPosition < -theElems.length
  ) {
    return
  }

  rotate(theElems, fromPosition)

  const capturedElements = []

  let elemAmount = cmd[1]

  for (const elem of theElems) {
    const elemType = elem[4]

    if (elemType !== 'd' && elemType !== 'c') {

      capturedElements.push(elem.slice(0))

      if (cmdName === 'd' || cmdName === 'm') {
        // modifies elems
        elem[4] = 'd'
      }

      if (--elemAmount === 0) {
        break
      }
    }
  }

  // .splice(pos, amount, replacement) -> deleted_values
  // .splice(n, 0) : does nothing
  // .splice(bigger_than_arr, m) : does nothing
  capturedElements
    .forEach(v => v.splice(3, 1, 'c'))

  // insert commands to new position
  if ((cmdName === 'c' || cmdName === 'm') && capturedElements.length > 0) {

    let elemCount   = contentElementCount
    let thePosition = 0

    while (elemCount > 0) {
      thePosition += elems[toSet]
        .slice(thePosition)
        .findIndex(v => v[4] === 'n' || v[4] === 'd')
      thePosition++
      elemCount--
    }

    // modifies elems
    elems[toSet].splice(
      thePosition,
      0,
      ...capturedElements,
    )
  }

  // rotate back
  rotate(theElems, -fromPosition)
}
