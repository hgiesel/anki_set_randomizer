import {
  namePattern,
  getCorrespondingSets,
} from './util.js'

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
    .forEach(v => {
      const [
        _,
        isLastMinute,
        name,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[1]

      const correspondingSets = getCorrespondingSets(
        elementsOriginal,
        namedSets,
        absolutePos,
        absolutePosFromEnd,
        v[0][1],
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      )

      let theNs = namedSets.find(w => w.name === name)

      if (!theNs) {
        const idx = namedSets.push({
          iter: v[0][0],
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
    })

  return namedSets
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
    .map(v => [v, v[3].match(orderConstraintPattern)])
    .filter(v => v[1])
    .forEach(v => {
      const [
        _,
        isLastMinute,
        name,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[1]

      const correspondingSets = (otherNamedSet && !otherNamedSetPos)
        ? [otherNamedSet]
        : getCorrespondingSets(
          elementsOriginal,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0][1],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )

      let theOc = orderConstraints.find(v => v.name === name)

      if (!theOc) {
        const idx = orderConstraints.push({
          name: name,
          lastMinute: false,
          sets: [],
          dictator: false, // will be determined at a later stage
        })

        theOc = orderConstraints[idx - 1]
      }

      theOc.sets.push(...correspondingSets)
      theOc.sets.sort()

      if (isLastMinute) {
        theOc.lastMinute = true
      }
    })

  return orderConstraints
}
