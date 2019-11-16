export const shuffle = function(array) {
  const result = array.slice(0)
  let currentIndex = array.length, temporaryValue = null, randomIndex = null

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = result[currentIndex]
    result[currentIndex] = result[randomIndex]
    result[randomIndex] = temporaryValue
  }

  return result
}

export const shuffleOrder = Symbol('shuffleOrder')
export const shuffleNew = Symbol('shuffleNew')
export const shuffleOld = Symbol('shuffleOld')

export const getShuffler = function(reoMatcher, orders, orderApplications) {
  const shuffleFromNs = function(
    ns,
    nsLength,
  ) {
    let orderOld = null
    let orderApplied = null

    if (orderApplied = orderApplications[ns.name]) {
      return {
        type: shuffleOrder,
        shuffle: orders
          .find(o => o.name === orderApplied)
          .order
          .filter(index => index < nsLength)
      }
    }

    else if (orderOld = reoMatcher.matchReorder(ns)) {
      const underflow = nsLength - orderOld.length
      const additionalIndices = underflow > 0
        ? shuffle([...Array(underflow).keys()].map(v => v + orderOld.length))
        : []

      return {
        type: shuffleOld,
        shuffle: orderOld.concat(additionalIndices)
      }
    }

    else {
      return {
        type: shuffleNew,
        shuffle: shuffle([...Array(nsLength).keys()]),
      }
    }
  }

  return {
    shuffleFromNs: shuffleFromNs,
  }
}

export default getShuffler
