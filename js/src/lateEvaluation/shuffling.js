import {
  getCorrespondingSets,
} from './util.js'

export function processNamedSet(
  namedSets, elementsOriginal,

  iterName, setIndex, posIndex,

  isLastMinute,
  name,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  otherNamedSet,
  otherNamedSetPos,
) {

  const correspondingSets = getCorrespondingSets(
    elementsOriginal,
    namedSets,
    absolutePos,
    absolutePosFromEnd,
    setIndex,
    relativePos,
    otherNamedSet,
    otherNamedSetPos,
  )

  let theNs = namedSets.find(w => w.name === name)

  if (!theNs) {
    const idx = namedSets.push({
      iter: iterName,
      name: name,
      lastMinute: false,
      sets: []
    })

    theNs = namedSets[idx - 1]
  }

  theNs.sets.push(...correspondingSets)
  theNs.sets.sort()

  if (isLastMinute) {
    theNs.lastMinute = true
  }
}

export function processOrderConstraint(
  currentPos,
  elementsOriginal,
  orderConstraints,

  isLastMinute,
  name,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  otherNamedSet,
  otherNamedSetPos,
) {

  const correspondingSets = (otherNamedSet && !otherNamedSetPos)
    ? [otherNamedSet]
    : getCorrespondingSets(
      elementsOriginal,
      namedSets,
      absolutePos,
      absolutePosFromEnd,
      currentPos,
      relativePos,
      otherNamedSet,
      otherNamedSetPos,
    )

  let theOc

  let oc = (theOc = orderConstraints.find(v => v.name === name))
    ? theOc
    : orderConstraints[orderConstraints.push({
      name: name,
      lastMinute: false,
      sets: [],
      dictator: false, // will be determined at a later stage
    }) - 1]

  oc.sets.push(...correspondingSets)
  oc.sets.sort()

  if (isLastMinute) {
    oc.lastMinute = true
  }
}
