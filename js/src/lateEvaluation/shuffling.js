import {
  getCorrespondingSets,
  getBool,
  evalKeywordArguments,
  toOptArg,
} from './util.js'

const keywordProcess = function(kwArgs) {
  return toOptArg(evalKeywordArguments(kwArgs))
}

export const processNamedSet = function(
  iterName, setIndex, posIndex,

  name,
  pos,
  kwArgs,

  numberedSets,
  namedSets,
  orderConstraints,
) {
  const keywords = keywordProcess(kwArgs)

  const correspondingSets = getCorrespondingSets(
    numberedSets,
    namedSets,

    pos,
    setIndex,
  )

  const actualName = name === '_'
    ? `_unnamed${Math.random().toString().slice(2)}`
    : name

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

  if (getBool(keywords.force) || getBool(keywords.forceOrder)) {
    ns.force = true
  }

  else if (keywords.order) {
    processOrderConstraint(
      iterName, setIndex, posIndex,

      keywords.order,
      correspondingSets,

      keywords.forceOrder,
      orderConstraints
    )
  }
}

export const processOrderConstraint = function(
  iterName, setIndex, posIndex,

  orderName,
  correspondingSets,

  forceOrder,
  orderConstraints,
) {
  let theOc = null
  const oc = (theOc = orderConstraints.find(v => v.name === orderName))
    ? theOc
    : orderConstraints[orderConstraints.push({
      iter: iterName,
      name: orderName,
      sets: [],
      force: false,
      dictator: false /* determined at later stage */,
    }) - 1]

  oc.sets.push(...correspondingSets)

  if (getBool(forceOrder)) {
    oc.force = true
  }
}
