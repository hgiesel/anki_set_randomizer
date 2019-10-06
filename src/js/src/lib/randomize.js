import {
  reorderNumberedSets,
  reorderNamedSets,
  applyOrderConstraint
} from './reorder'


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
