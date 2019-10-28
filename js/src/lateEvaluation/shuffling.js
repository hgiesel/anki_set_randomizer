import {
  getCorrespondingSets,
  getBool,
  evalKeywordArguments,
  toOptArg,
} from './util.js'

function keywordProcess(kwArgs) {
  return toOptArg(evalKeywordArguments(kwArgs))
}

export function processNamedSet(
  iterName, setIndex, posIndex,

  name,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  namedSetPos,
  nsPos,
  kwArgs,

  numberedSets,
  namedSets,
  orderConstraints,
) {

  console.log(iterName, setIndex, posIndex)

  const keywords = keywordProcess(kwArgs)

  const correspondingSets = getCorrespondingSets(
    numberedSets,
    namedSets,
    absolutePos,
    absolutePosFromEnd,
    setIndex,
    relativePos,
    namedSetPos,
    nsPos,
  )

  const actualName = name === '_'
    ? `_unnamed${Math.random().slice(2)}`
    : name

  let helpNs
  const ns = (helpNs = namedSets.find(w => w.name === actualName))
    ? theNs
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
      actualName,
      keywords.forceOrder,
      orderConstraints
    )
  }
}

export function processOrderConstraint(
  name,
  forceOrder,
  orderConstraints,
) {

  let theOc
  const oc = (theOc = orderConstraints.find(v => v.name === name))
    ? theOc
    : orderConstraints[orderConstraints.push({
      iter: iterName,
      name: name,
      sets: [],
      force: false,
      dictator: false /* determined at later stage */,
    }) - 1]

  oc.sets.push(...correspondingSets)

  if (getBool(forceOrder)) {
    oc.force = true
  }
}
