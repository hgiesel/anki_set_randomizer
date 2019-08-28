import {
  namePattern,
  getCorrespondingSets,
} from './util.js'

export function processSharedElementsGroups(originalStructure) {

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

  const sharedElementsGroups = []

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
        sharedElementsGroups,
        absolutePos,
        absolutePosFromEnd,
        v[0],
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      )

      let theSeg = sharedElementsGroups.find(v => v.name === name)

      if (!theSeg) {
        const idx = sharedElementsGroups.push({
          name: name,
          lastMinute: false,
          sets: []
        })

        theSeg = sharedElementsGroups[idx - 1]
      }

      theSeg.sets.push(...correspondingSets)
      theSeg.sets.sort()

      if (isLastMinute) {
        theSeg.lastMinute = true
      }
    })

  return sharedElementsGroups
}

export function processSharedOrderGroups(originalStructure, namedSets) {
  const sharedOrderGroups = []

  const sharedOrderPattern = new RegExp(
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
    .map(v => [...v, v[2].match(sharedOrderPattern)])
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

      let theSog = sharedOrderGroups.find(v => v.name === name)

      if (!theSog) {
        const idx = sharedOrderGroups.push({
          name: name,
          lastMinute: false,
          sets: [],
          dictator: false, // will be determined at a later stage
        })

        theSog = sharedOrderGroups[idx - 1]
      }

      theSog.sets.push(...correspondingSets)
      theSog.sets.sort()

      if (isLastMinute) {
        theSog.lastMinute = true
      }
    })

  return sharedOrderGroups
}
