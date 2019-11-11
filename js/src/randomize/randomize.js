import toReorders from './transform.js'
import shuffleReorders from './shuffling.js'
import applyReorders from './reorder.js'
// import applyCommands from './commands.js'

// numbered are sorted 0 -> n, then named are in order of appearance
export const randomize = function(
  elements,
  reorderMatcher,
  namedSets /* reo.order is modified */,
  orderConstraints,
  commands,
) {
  const reorders = toReorders(namedSets, elements)

  // add reo.order using uc, inherited, or from new
  shuffleReorders(reorders, reorderMatcher, orderConstraints)

  // apply reorders
  const [
    reordersApplied,
    elementsNew,
  ] = applyReorders(reorders, elements)

  // modifies elementsNew
  // applyCommands(commands, elementsNew)

  return [
    reordersApplied,
    elementsNew,
  ]
}

export default randomize
