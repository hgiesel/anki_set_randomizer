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

export function applySetReorder(sr, elems, elemsOrig) {
  switch (typeof sr.name) {
    case 'number':
      const saveElems = elemsOrig[sr.name]
      elems[sr.name] = sortWithIndices(saveElems, sr.order)
      break

    case 'string':
      const flatSaveElems = sr.sets.map(v => elemsOrig[v]).flat()
      sliceWithLengths(sortWithIndices(flatSaveElems, sr.order), sr.setLengths)
        .forEach((v, i) => {
          elems[sr.sets[i]] = v
        })
      break
  }
}

// values states include 'n', 'c', 'd'
// cmds states include 'c', 'd', 'm'
// cmd = [0:fromSet, 1:fromPosition, 2:fromAmount, 3:cmdName, 4:toSet, 5:toPosition, 6:contentElementCount]
export function applyCommand(cmd, elems) {

  const fromSet             = cmd[0]
  const fromPosition        = cmd[1]
  const cmdName             = cmd[3]
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

  rotate(theElems, fromPosition)

  const capturedElements = []

  let elemAmount = cmd[2]

  for (const elem of theElems) {
    const elemType = elem[3]

    if (elemType !== 'd' && elemType !== 'c') {

      capturedElements.push(elem.slice(0))

      if (cmdName === 'd' || cmdName === 'm') {
        // modifies elems
        elem[3] = 'd'
      }

      if (--elemAmount === 0) {
        break
      }
    }
  }

  // .splice(pos, amount, replacement) -> deleted_values
  // .splice(n, 0) : does nothing
  // .splice(bigger_than_arr, m) : does nothing
  capturedElements.forEach(v => v.splice(3, 1, 'c'))

  // insert commands to new position
  if ((cmdName === 'c' || cmdName === 'm') && capturedElements.length > 0) {

    let elemCount   = contentElementCount
    let thePosition = 0

    while (elemCount > 0) {
      thePosition += elems[toSet]
        .slice(thePosition)
        .findIndex(v => v[3] === 'n' || v[3] === 'd')
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

export function applyInheritedSetReorder(newReorders, inheritedNewReorders, structureMatches) {
  const modifiedReorders = []

  for (const reorder of newReorders) {
    let match

    if ((typeof reorder.name) === 'string') {
      if (match = inheritedNewReorders.find(v => reorder.name === v.name)) {

        modifiedReorders.push({
          name: reorder.name,
          length: reorder.length,
          sets: reorder.sets,
          setLengths: reorder.setLengths,
          order: complementArrays(match.order, reorder.order),
          lastMinute: reorder.lastMinute,
        })

      }
      else {
        modifiedReorders.push(reorder)
      }
    }

    else if (match = structureMatches.find(v => reorder.name === v.to)) {
      modifiedReorders.push(inheritedNewReorders.find(v => v.name === match.from))
    }
    else {
      modifiedReorders.push(reorder)
    }
  }

  return modifiedReorders
}
