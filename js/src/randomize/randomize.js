import shuffleReorders from './shuffling.js'
import applyReorder from './reorder.js'
import applyCommands from './commands.js'

// numbered are sorted 0 -> n, then named are in order of appearance
export const randomize = function(
  reorders /* reo.order is modified */,
  orderConstraints,
  commands,
  reorderMatcher,
  elements
) {
  // shuffle reorders from uc, inherited, or new
  shuffleReorders(reorders, reorderMatcher, orderConstraints)

  // apply reorders
  const [
    reordersApplied,
    elementsNew,
  ] = applyReorder(reorders, elements)

  // modifies elementsNew
  applyCommands(commands, elementsNew)

  return [
    reordersApplied,
    elementsNew,
  ]
}

export default randomize
