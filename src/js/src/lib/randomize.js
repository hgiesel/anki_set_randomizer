import {
  reorderNumberedSets,
  reorderSharedElementsGroups,
  applySharedOrder
} from './reorder'


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
