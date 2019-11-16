import styleSetter from './styleSetter.js'

import elementMatcher from './matchElem.js'

import pregenManager from './expand/pregen.js'
import expand from './expand/expand.js'

export const process = function(
  elements,
  generatedValues,
  uniqConstraints,
  defaultStyle,
) {
  const ss = styleSetter(defaultStyle)
  const elemMatcher = elementMatcher(ss)

  const elementsMatched = elements
    .map(set => set.flatMap(elem => elemMatcher.match(...elem)))

  const pregenMngr = pregenManager(
    generatedValues,
    uniqConstraints,
    elemMatcher.exportValueSets(),
    elemMatcher.exportEvaluators()
  )

  const markedForDeletion = elemMatcher.exportMarkedForDeletion()
  const elementsExpanded = elementsMatched
    .map(set => set.flatMap(elem => expand(pregenMngr, ...elem)))
    .filter((_, idx) => !markedForDeletion.includes(idx))

  return [
    elementsExpanded,
    pregenMngr.exportGeneratedValues(),
    pregenMngr.exportUniqConstraints(),
    elemMatcher.exportValueSets(),
    elemMatcher.exportStatements(),
    elemMatcher.exportYanks(),
    ss.exportStyleDefinitions(),
  ]
}

export default process
