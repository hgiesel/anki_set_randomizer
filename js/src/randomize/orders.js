import {
  getLengths,
} from './util.js'

import {
  shuffle,
  shuffleNew,
  shuffleOld,
} from './shuffling.js'

const detectDictator = function(namedSets, elements, shuffler, oc) {
  const findDictator = function(accu, setName) {
    const foundNs = namedSets
      .find(ns => ns.name === setName)

    if (foundNs) {
      const [
        foundLength,
        // setLengths,
      ] = getLengths(foundNs, elements)

      const shuf = shuffler.shuffleFromNs(foundNs, foundLength)

      if (accu) {
        return shuf.type === shuffleOld && accu.type === shuffleNew
          ? shuf
          : accu.shuffle.length < shuf.shuffle.length
          ? shuf
          : accu
      }

      return shuf
    }

    return accu
  }

  return oc
    .sets
    .reduce(findDictator, null)
}

const detectDictatorLength = function(namedSets, elements, oc) {
  const findDictatorLength = function(accu, setName) {
    const foundNs = namedSets
      .find(ns => ns.name === setName)

    if (foundNs) {
      const [
        foundLength,
        // setLengths,
      ] = getLengths(foundNs, elements)

      if (accu) {
        const [
          accuNs,
          accuLength,
        ] = accu

        return accuLength < foundLength
          ? [foundNs, foundLength]
          : [accuNs, accuLength]
      }

      return [foundNs, foundLength]
    }

    return accu
  }

  return oc
    .sets
    .reduce(findDictatorLength, null)
}

export const processOrderConstraints = function(
  orderConstraints,
  ordersOld,
  namedSets,
  elements,
  shuffler,
) {
  const result = [...ordersOld]

  const processOc = function(oc) {
    const matchIndex = result.findIndex(orderOld => orderOld.name === oc.name)

    if (matchIndex > -1) {
      const [
        /* ns */,
        maxLength,
      ] = detectDictatorLength(namedSets, elements, oc)

      const oldLength = result[matchIndex].order.length
      const underflow = maxLength - oldLength

      const additionalIndices = underflow > 0
        ? shuffle([...Array(underflow).keys()]
          .map(v => v + oldLength))
        : []

      result[matchIndex] = {
        name: oc.name,
        order: result[matchIndex].order.concat(additionalIndices),
      }
    }

    const maybeDictator = detectDictator(namedSets, elements, shuffler, oc)

    if (maybeDictator) {
      result.push({
        name: oc.name,
        order: maybeDictator.shuffle,
      })
    }
  }

  orderConstraints
    .forEach(oc => processOc(oc))

  return result
}

export default processOrderConstraints
