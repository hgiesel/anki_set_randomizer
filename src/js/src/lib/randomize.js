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
  sharedOrderGroups,
) {

  const elements     = initializeNumberedSets(numberedSets)
  const elementsCopy = JSON.parse(JSON.stringify(elements))

  const setReorders  = [
    reorderNumberedSets(numberedSets),
    reorderSharedElementsGroups(sharedElementsGroups, numberedSets),
  ].flat()

  // modifies setReorders (!)
  sharedOrderGroups.forEach(sog => applySharedOrder(sog, setReorders))
  return [elements, elementsCopy, setReorders]
}
