import {
  reorderNumberedSets,
  reorderElementSharingSets,
  applySharedOrder
} from './reorder'


function initializeNumberedSets(numberedSets) {
  return numberedSets
    .map(v => v.elements)
    .map(u => u.map(w => [w[0], w[1], w[2], 'n']))
}
export function generateRandomization(
  numberedSets,
  elementSharingSets,
  orderSharingSets,
) {

  const elements     = initializeNumberedSets(numberedSets)
  const elementsCopy = JSON.parse(JSON.stringify(elements))

  const setReorders  = [
    reorderNumberedSets(numberedSets),
    reorderElementSharingSets(elementSharingSets, numberedSets),
  ].flat()

  // modifies setReorders (!)
  orderSharingSets.forEach(oss => applySharedOrder(oss, setReorders))
  return [elements, elementsCopy, setReorders]
}
