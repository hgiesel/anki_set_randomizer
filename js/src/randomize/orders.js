import {
  getLengths,
} from './util.js'

export const getDictatorOrders = function(orderConstraints, namedSets, elements, shuffler) {
  const detectOrderDictator = function(oc) {
    return oc
      .sets
      .reduce((accu, setName) => {
        const foundNs = namedSets.find(ns => ns.name === setName)

        const [
          foundLength,
          // setLengths,
        ] = getLengths(foundNs, elements)

        if (accu) {
          const [
            accuNs,
            accuLength,
          ] = accu

          return accuLength <= foundLength
            ? [accuNs, accuLength]
            : [foundNs, foundLength]
        }

        else {
          return [foundNs, foundLength]
        }
      }, null)
  }

  const processOc = function(oc) {
    return {
      sets: oc.sets,
      order: shuffler.shuffleFromNs(...detectOrderDictator(oc)),
    }
  }

  return orderConstraints
    .map(oc => processOc(oc))
}

export default getDictatorOrders
