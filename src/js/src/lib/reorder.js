function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex   = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue      = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex]  = temporaryValue
  }
  return array;
}

function detectOrderDictator(sog, setReorders) {
  return sog.sets.map(v => ({
    name: v,
    length: setReorders.find(w => w.name === v).length
  })).reduce((accu, v) => accu.length < v.length ? v : accu).name
}

export function reorderNumberedSets(numberedSets) {
  return numberedSets.map(v => ({
    name: v.name,
    length: v.elements.length,
    sets: [v.name],
    setLengths: [v.elements.length],
    order: shuffle([...new Array(v.elements.length).keys()]),
    lastMinute: v.lastMinute,
  }))
}

export function reorderSharedElementsGroups(sharedElementsGroups, numberedSets) {
  return sharedElementsGroups.map(v => {

    const containedNumberedSets = v.sets
      .map(v => numberedSets.filter(u => u.name === v))

    const setLengths = containedNumberedSets
      .map(v => v[0].elements.length)

    const elementCount = setLengths
      .reduce((accu, w) => accu + w, 0)

    return {
      name: v.name,
      length: elementCount,
      sets: v.sets,
      setLengths: setLengths,
      order: shuffle([...new Array(elementCount).keys()]),
      lastMinute: v.lastMinute,
    }
  })
}

export function applySharedOrder(sog, setReorders) {

  const dictator = detectOrderDictator(sog, setReorders)
  sog.dictator = dictator

  const dictatorOrder = setReorders.find(v => v.name === sog.dictator).order

  for (const set of sog.sets) {

    const oldOrder = setReorders.find(v => v.name === set).order
    const newOrder = dictatorOrder.filter(v => v < oldOrder.length)

    // modifies setReorders
    setReorders.forEach(v => {
      if (v.name === set) {
        v.order = newOrder
        if (sog.lastMinute) {
          v.lastMinute = true
        }
      }
    })
  }

  return setReorders
}

