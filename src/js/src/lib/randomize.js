import {
  reorderNumberedSets,
  reorderElementSharingSets,
  applySharedOrder
} from './reorder'

import {
  applySetReorder,
  applyCommand,
} from './sort'

export default function generateRandomization(numberedSets, elementSharingSets, orderSharingSets, lastMinute) {
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

  // numbered are sorted 0 -> n, then named are in order of appearance
  // modifies elementsCopy (!)
  setReorders
    .filter(v => v.lastMinute || !lastMinute)
    .forEach(sr => applySetReorder(sr, elementsCopy, elements))

  return [elementsCopy, setReorders]
}
