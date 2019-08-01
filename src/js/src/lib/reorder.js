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

export function reorderNumberedSets(numberedSets) {
  return numberedSets.map(v => ({
    name: v.name,
    length: v.elements.length,
    order: shuffle([...new Array(v.elements.length).keys()]),
    lastMinute: v.lastMinute,
  }))
}

export function reorderElementSharingSets(elementSharingSets, numberedSets) {
  return elementSharingSets.map(v => {

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

function detectOrderDictator(orderSharingSet, setReorders) {
  return orderSharingSet.sets.map(v => ({
    name: v,
    length: setReorders.filter(w => w.name === v)[0].length
  })).reduce((accu, v) => accu.length < v.length ? v : accu).name
}

export function applySharedOrder(orderSharingSet, setReorders) {
  const dictator = detectOrderDictator(orderSharingSet, setReorders)
  const dictatorOrder = setReorders.filter(v => v.name === dictator)[0].order

  for (const set of orderSharingSet.sets) {
    const oldOrder = setReorders.filter(v => v.name === set)[0].order
    const newOrder = dictatorOrder.filter(v => v < oldOrder.length)
    setReorders.forEach(v => {
      if (v.name === set) {
        v.order = newOrder
      }
    })
  }

  return setReorders
}
