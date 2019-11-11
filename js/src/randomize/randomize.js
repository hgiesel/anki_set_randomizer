import processOrderConstraints from './orders.js'
import getShuffler from './shuffling.js'
import applyReorders from './reorder.js'
// import applyCommands from './commands.js'

export const randomize = function(
  elements /* is modified !!! */,
  reorderMatcher,
  namedSets,
  orderConstraints,
  // commands,
) {
  const dictatedOrders = processOrderConstraints(
    orderConstraints,
    namedSets,
    elements,
    getShuffler(reorderMatcher, []),
  )

  const reorders = applyReorders(
    namedSets,
    elements,
    getShuffler(reorderMatcher, dictatedOrders),
  )

  // applyCommands(
  //   commands,
  //   elements,
  // )

  return reorders
}

export default randomize
