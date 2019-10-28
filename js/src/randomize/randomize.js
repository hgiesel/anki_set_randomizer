import {
  reorderNumberedSets,
  reorderNamedSets,
  applyOrderConstraint
} from './reorder.js'

import {
  applySetReorder,
  applyCommands,
} from './sort.js'

import {
  matchStructures,
  matchGeneratedValues,
  matchSetReorder,
  reorderForRendering,
} from './matching.js'

export function generateRandomization(
  numberedSets,
  namedSets,
) {
  const elements = numberedSets.map(v => v.elements)

  const setReorders = [
    reorderNumberedSets(numberedSets),
    reorderNamedSets(namedSets, numberedSets),
  ].flat()

  return [elements, setReorders]
}

export function shareOrder(
  orderConstraints,
  setReorders,
) {
  // modifies setReorders (!)
  orderConstraints
    .forEach(orderConstraint => applyOrderConstraint(orderConstraint, setReorders))
}

export function adjustForSecondRandomization(orderConstraints, numberedSets, namedSets) {

  const joinedSets = [numberedSets, namedSets].flat()

  for (const oc of orderConstraints.filter(v => v.lastMinute)) {
    for (const set of oc.sets) {
      joinedSets.find(v => v.name === set).lastMinute = true
    }
  }
}

// numbered are sorted 0 -> n, then named are in order of appearance
export default function randomize(numberedSets, namedSets, orderConstraints, commands, reordersInherited, structureMatches, lastMinute=false) {

  const [elements, reordersAlpha] = generateRandomization(numberedSets, namedSets)

  const reordersBeta = !lastMinute
    ? reordersAlpha
    : reordersAlpha.filter(v => v.lastMinute)

  const reorders = matchSetReorder(
    structureMatches,
    reordersInherited,
    reordersBeta,
  )

  // modifies reorders
  shareOrder(orderConstraints, reorders)

  // both modify elements
  applySetReorder(reorders, elements)
  applyCommands(commands, elements)

  return [
    reorders,
    elements,
  ]
}
