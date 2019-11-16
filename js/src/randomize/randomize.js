import processOrderConstraints from './orders.js'
import getShuffler from './shuffling.js'
import applyReorders from './reorder.js'
// import applyCommands from './commands.js'

export const randomize = function(
  elements /* is modified !!! */,
  reorderMatcher,
  ordersOld,
  namedSets,
  orderConstraints,
  orderApplications,
  // commands,
) {
  const orders = processOrderConstraints(
    orderConstraints,
    ordersOld,
    namedSets,
    elements,
    getShuffler(reorderMatcher, [], {}),
  )

  const shuffles = applyReorders(
    namedSets,
    elements,
    getShuffler(reorderMatcher, orders, orderApplications),
    orders,
  )

  // applyCommands(
  //   commands,
  //   elements,
  // )

  return [
    shuffles,
    orders,
  ]
}

export default randomize
