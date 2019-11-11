const shuffle = function(array) {
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

export const getShuffler = function(reoMatcher, dictatedOrders) {
  const shuffleFromNs = function(
    ns,
    nsLength,
  ) {
    let orderOld = null
    let dictatedMatch = null

    if (dictatedMatch = dictatedOrders.find(dio => dio.sets.includes(ns.name))) {
      return dictatedMatch.order.filter(index => index < nsLength)
    }

    else if (orderOld = reoMatcher.matchReorder(ns)) {
      const additionalIndices = [...Array(nsLength).keys()]
        .filter(v => !orderOld.includes(v))

      return orderOld.concat(shuffle(additionalIndices))
    }

    else {
      return shuffle([...Array(nsLength).keys()])
    }
  }

  return {
    shuffleFromNs: shuffleFromNs,
  }
}

export default getShuffler
