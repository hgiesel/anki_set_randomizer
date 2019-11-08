const shuffle = function(array) {
  let currentIndex = array.length, temporaryValue = null, randomIndex = null

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

const detectOrderDictator = function(orderConstraint, setReorders) {
  return orderConstraint
    .sets
    .map(v => ({
      name: v,
      length: setReorders.find(w => w.name === v).length
    }))
    .reduce((accu, v) => (accu.length < v.length ? v : accu))
    .name
}

export const reorderNumberedSets = function(numberedSets) {
  return numberedSets.map(v => ({
    iter: v.iter,
    name: v.name,
    length: v.elements.length,
    sets: [[v.iter, v.name]],
    setLengths: [v.elements.length],
    order: shuffle([...new Array(v.elements.length).keys()]),
    force: v.force,
  }))
}

export const reorderNamedSets = function(namedSets, numberedSets) {
  return namedSets.map((u) => {
    const containedNumberedSets = u.sets
      .map(v => numberedSets.filter(w => w.name === v))

    const setLengths = containedNumberedSets
      .map(v => v[0].elements.length)

    const elementCount = setLengths
      .reduce((accu, w) => accu + w, 0)

    return {
      iter: u.iter,
      name: u.name,
      length: elementCount,
      sets: u.sets.map(w => [u.iter, w]),
      setLengths: setLengths,
      order: shuffle([...new Array(elementCount).keys()]),
      force: u.force,
    }
  })
}

export const applyOrderConstraint = function(orderConstraint, setReorders) {
  const dictator = detectOrderDictator(orderConstraint, setReorders)
  orderConstraint.dictator = dictator

  const dictatorOrder = setReorders.find(v => v.name === orderConstraint.dictator).order

  for (const set of orderConstraint.sets) {
    const oldOrder = setReorders.find(v => v.name === set).order
    const newOrder = dictatorOrder.filter(v => v < oldOrder.length)

    // modifies setReorders
    setReorders.forEach((v) => {
      if (v.name === set) {
        v.order = newOrder
        if (orderConstraint.force) {
          v.force = true
        }
      }
    })
  }

  return setReorders
}
