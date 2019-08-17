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
// cmd = [0:fromSet, 1:fromPosition, 2:fromAmount, 3:cmdName, 4:toSet, 5:toPosition]
export function applyCommand(cmd, elems) {

  // delete commands in original position
  // from position is IGNORED (!) atm
  const capturedElements = []

  for (const elem of elems[cmd[0]]) {

    if (elem[3] !== 'd' && elem[3] !== 'c') {
      capturedElements.push(elem.map(v => v))

      if (cmd[3] === 'd' || cmd[3] === 'm') {
        elem[3] = 'd'
      }

      if (--cmd[2] === 0) {
        break
      }
    }
  }

  // .splice(pos, amount, replacement) -> deleted_values
  // .splice(n, 0) : does nothing
  // .splice(bigger_than_arr, m) : does nothing
  capturedElements.forEach(v => v.splice(3, 1, 'c'))

  // insert commands to new position
  if (cmd[3] === 'c' || cmd[3] === 'm') {
      elems[cmd[4]].splice(
        cmd[5],
        0,
        ...capturedElements,
      )
  }
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
