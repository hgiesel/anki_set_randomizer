import {
  namePattern,
  getCorrespondingSets,
} from './util.js'


function processNamedSet(
  iterName,
  currentPos,
  elementsOriginal,
  namedSets,

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
    currentPos,
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

export function processNamedSets(elementsOriginal) {

  const namedSetPattern = new RegExp(
    `\\$(?:name|n)(!)?` +
    `\\(` +
    `(${namePattern})` +
    `(?:` +
    `\\s*,\\s*` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  const namedSets = []

  elementsOriginal
    .flat()
    .map(v => [v, v[3].match(namedSetPattern)])
    .filter(v => v[1])
    // sort self-referring sets to beginning
    .reduce((accu, v) => {
      v[1][3] || v[1][4] || v[1][5] || v[1][6] || v[1][7]
        ? accu.push(v)
        : accu.unshift(v)
      return accu
    }, [])
    .forEach(elem => {


      processNamedSet(
        elem[0][0],
        elem[0][1],
        elementsOriginal,
        namedSets,
        ...elem[1].slice(1),
      )

    })

  return namedSets
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

export function processOrderConstraints(elementsOriginal, namedSets) {
  const orderConstraints = []

  const orderConstraintPattern = new RegExp(
    `\\$(?:order|ord|o)(!)?` +
    `\\(` +
    `(${namePattern})` +
    `(?:` +
    `\\s*,\\s*` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  elementsOriginal
    .flat()
    .forEach(elem => {

      let match
      if (match = elem[3].match(orderConstraintPattern)) {

        processOrderConstraint(
          match[1],
          elementsOriginal,
          orderConstraints,
          isLastMinute,
          name,
          absolutePos,
          absolutePosFromEnd,
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )
      }
    })

  return orderConstraints
}
