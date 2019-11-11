import {
  shuffle,
} from './util.js'

const shuffleNamedSets = function(reorders, reorderMatcher, orderConstraints) {
  for (const reo of reorders) {
    let maybeReorder = null
    let maybeOc = null

    if (maybeOc = orderConstraints.find(oc => oc.sets.includes(reo.name))) {
      reo.order = maybeOc.dictator.order.filter(index => index < reo.length)
    }

    else if (maybeReorder = reorderMatcher.matchReorder(reo)) {
      reo.order = maybeReorder
    }

    else {
      reo.order = shuffle([...Array(reo.length).keys()])
    }
  }
}

/////////////////
// ORDERS
const detectOrderDictator = function(oc, reorders) {
  const dictator = oc.sets.reduce((accuReo, setName) => {
    const foundReorder = reorders.find(w => w.name === setName)

    return accuReo.length <= foundReorder.length
      ? foundReorder
      : accuReo
  })

  return dictator
}

const processOrderConstraints = function(reorders, reorderMatcher, orderConstraints) {
  for (const oc of orderConstraints) {
    // dictator ultimately decides order of other sets of same uc
    oc.dictator = detectOrderDictator(oc, reorders)
    shuffleNamedSets([oc.dictator], reorderMatcher, [])
  }
}

///////////
export const shuffleReorders = function(reorders, reorderMatcher, orderConstraints) {
  processOrderConstraints(reorders, reorderMatcher, orderConstraints)
  shuffleNamedSets(reorders, reorderMatcher, orderConstraints)
}

export default shuffleReorders
