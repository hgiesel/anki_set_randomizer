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

// cmd = [0:toSet, 1:toPosition, 2:cmdName, 3:fromSet, 4:fromPosition, 5:amount]
export function applyCommand(cmd, elems) {

  const saveElems = elems[cmd[3]]
    .filter(v => v[3] === 'n')
    .slice(cmd[4], cmd[4] + cmd[5])

  if (cmd[2] === 'd' || cmd[2] === 'm') {
    elems[cmd[3]].splice(cmd[4], cmd[5], ...saveElems.map(v => [v[0], v[1], v[2], 'd']))
  }

  if (cmd[2] === 'c' || cmd[2] === 'm') {
    elems[cmd[0]].splice(cmd[1], 0, ...saveElems.map(v => [v[0], v[1], v[2], cmd[2]]))
  }
}
