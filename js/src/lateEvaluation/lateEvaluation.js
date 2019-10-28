
import styleSetter from './styleSetter'
import {
  processStyle,
} from './stylings.js'

export default function lateEvaluate(
  numberedSets,
  defaultStyle,

  namedSetStatements,
  commandStatements,
  styleStatements,
  applyStatements,
) {

  const namedSets = []
  namedSetStatements
    .reduce((accu, elem) => {
      elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
        ? accu.push(elem)
        : accu.unshift(elem)
      return accu
    }, [])
    .forEach(elem =>
      processNamedSet(
        namedSets,
        numberedSets.map(unit => unit.sets),
        ...elem,
      ))

  // processOrderConstraint(
  //   match[1],
  //   elementsOriginal,
  //   orderConstraints,
  //   isLastMinute,
  //   name,
  //   absolutePos,
  //   absolutePosFromEnd,
  //   relativePos,
  //   otherNamedSet,
  //   otherNamedSetPos,
  // )
  // const styleDefinitions  = processStyles(elements, defaultStyle)
  // const styleApplications = processApplications(elements, styleDefinitions, namedSets)
  // const styleRules        = processStyleRules(elements, styleDefinitions)

  const ss = styleSetter(defaultStyle)

  styleStatements
    .forEach(elem => processStyle(ss, ...elem.slice(3)))

  ss.exportStyleDefinitions()

  return [
    namedSets
  ]
}
