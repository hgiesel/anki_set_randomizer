import {
  reorderNumberedSets,
  reorderElementSharingSets,
  applySharedOrder
} from './reorder'

export default function generateRandomization(numberedSets, elementSharingSets, orderSharingSets) {
  const elements = numberedSets
    .map(v => v.elements)
    .map(v => v.map(u => [u[0], u[1], u[2], 'n']))

  const elementsCopy = JSON.parse(JSON.stringify(elements))
  const setReorders = [
    reorderNumberedSets(numberedSets),
    reorderElementSharingSets(elementSharingSets, numberedSets),
  ].flat()

  // modifies setReorders (!)
  orderSharingSets.forEach(oss => applySharedOrder(oss, setReorders))
  return [elements, elementsCopy, setReorders]
}
