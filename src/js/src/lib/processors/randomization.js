import {
  namePattern,
  getCorrespondingSets,
} from './util.js'

export function processNamedSets(originalStructure) {

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

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(namedSetPattern)])
    .filter(v => v[3])
    // sort self-referring sets to beginning
    .reduce((accu, v) => {
      v[3][3] || v[3][4] || v[3][5] || v[3][6] || v[3][7]
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
      ] = v[3]

      const correspondingSets = getCorrespondingSets(
        originalStructure,
        namedSets,
        absolutePos,
        absolutePosFromEnd,
        v[0],
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      )

      let theNs = namedSets.find(v => v.name === name)

      if (!theNs) {
        const idx = namedSets.push({
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

export function processOrderConstraints(originalStructure, namedSets) {
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

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(orderConstraintPattern)])
    .filter(v => v[3])
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
      ] = v[3]

      const correspondingSets = (otherNamedSet && !otherNamedSetPos)
        ? [otherNamedSet]
        : getCorrespondingSets(
          originalStructure,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0],
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
