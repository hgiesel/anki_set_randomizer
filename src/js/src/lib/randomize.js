import {
  reorderNumberedSets,
  reorderNamedSets,
  applyOrderConstraint
} from './reorder'


// TODO I think I can delete this
function initializeNumberedSets(numberedSets) {
  return numberedSets
    .map(v => v.elements)
    .map(u => u.map(w => [w[0], w[1], w[2], 'n']))
}

export function generateRandomization(
  numberedSets,
  sharedElementsGroups,
) {

  const elements     = initializeNumberedSets(numberedSets)
  const elementsCopy = JSON.parse(JSON.stringify(elements))

  const setReorders  = [
    reorderNumberedSets(numberedSets),
    reorderSharedElementsGroups(sharedElementsGroups, numberedSets),
  ].flat()

  return [elements, setReorders]
}

export function shareOrder(
  setReorders,
  sharedOrderGroups,
) {
  // modifies setReorders (!)
  sharedOrderGroups
    .forEach(sog => applySharedOrder(sog, setReorders))
}

export function adjustForSecondRandomization(orderConstraints, numberedSets, namedSets) {

  const joinedSets = [numberedSets, namedSets].flat()

  for (const oc of orderConstraints.filter(v => v.lastMinute)) {
    for (const set of oc.sets) {
      joinedSets.find(v => v.name === set).lastMinute = true
    }
  }
}
