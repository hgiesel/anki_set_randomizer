import {
  getBool,
} from './util.js'

export const processNamedSet = function(
  iterName, setIndex, posIndex, correspondingSets,

  shuffleName,
  keywords,
  namedSets,
) {
  const actualName = shuffleName === '_'
    ? `_unnamed${Math.random().toString().slice(2)}`
    : shuffleName

  let helpNs = null
  const ns = (helpNs = namedSets.find(w => w.name === actualName))
    ? helpNs
    : namedSets[namedSets.push({
      iter: iterName,
      name: actualName,
      sets: [],
      force: false,
    }) - 1]

  ns.sets.push(...correspondingSets)
  ns.sets.sort()

  if (getBool(keywords.force)) {
    ns.force = true
  }

  return actualName
}

export const processOrder = function(
  iterName, setIndex, posIndex, correspondingSets,

  orderName,
  keywords,
  orderConstraints,
  namedSets,
) {
  let theName = null

  if (typeof correspondingSets[0] === 'number') {
    theName = processNamedSet(iterName, setIndex, posIndex, '_', correspondingSets, keywords, namedSets)
  }

  else {
    const maybeNs = namedSets.find(ns => ns.name === correspondingSets[0])
    theName = maybeNs ? maybeNs.name : null
  }

  let theOc = null
  const oc = (theOc = orderConstraints.find(v => v.name === orderName))
    ? theOc
    : orderConstraints[orderConstraints.push({
      iter: iterName,
      name: orderName,
      sets: [/* only named sets allowed */],
      force: false,
      dictator: false /* determined at later stage */,
    }) - 1]

  if (typeof theName === 'string' /* valid */) {
    oc.sets.push(theName)

    if (getBool(keywords.force)) {
      oc.force = true
    }

    if (oc.force) {
      namedSets.find(ns => ns.name === theName).force = true
    }
  }

  return orderName /* never really used */
}
