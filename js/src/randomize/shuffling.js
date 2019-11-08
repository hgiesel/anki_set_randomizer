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

const shuffleNamedSets = function(reorders, reorderMatcher, orderConstraints) {
  for (const reo of reorders) {
    let maybeReorder = null
    let maybeOc = null

    if (maybeOc = orderConstraints.find(oc => oc.sets.includes(reo.name))) {
      reo.order = maybeOc.dictator.order.filter(index => index < reo.order.length)
    }

    else if (maybeReorder = reorderMatcher.matchReorder(reo)) {
      reo.order = maybeReorder
    }

    else {
      reo.order = shuffle(reo.order)
    }
  }
}

///////////////// ORDERS

const detectOrderDictator = function(oc, reorders) {
  const nullReo = { length: 0 }

  return oc.sets.reduce((accuReo, setName) => {
    const foundReorder = reorders.find(w => w.name === setName)

    return accuReo.length <= foundReorder.length
      ? foundReorder
      : accuReo
  }, nullReo)
}

const processOrderConstraints = function(orderConstraints, reorders) {
  for (const oc of orderConstraints) {
    // dictator ultimately decides order of other sets of same uc
    oc.dictator = detectOrderDictator(oc, reorders)
  }
}

///////////

export const shuffleReorders = function(reorders, reorderMatcher, orderConstraints) {
  processOrderConstraints(orderConstraints, reorders)
  shuffleNamedSets(reorders, reorderMatcher, orderConstraints)
}

export default shuffleReorders
