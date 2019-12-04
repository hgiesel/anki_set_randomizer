import styleSetter from './lexing/styleSetter.js'
import elementMatcher from './lexing/matchElem.js'

import pregenManager from './expansion/pregen.js'
import expander from './expansion/expander.js'

const filterElements = function(elements, markedForDeletion) {
  const setToShuffles = {}
  const elementsFiltered = []

  for (const [setId, set] of elements.entries()) {
    if (markedForDeletion.includes(setId)) {
      setToShuffles[setId] = null
    }

    else {
      const newId = elementsFiltered.push(set) - 1
      setToShuffles[setId] = newId
    }
  }

  return [
    elementsFiltered,
    setToShuffles,
  ]
}

export const process = function(
  elements,
  generatedValues,
  uniqConstraints,
  defaultStyle,
) {
  const ss = styleSetter(defaultStyle)
  const elemMatcher = elementMatcher(ss)

  const elementsMatched = elements
    .map(set => set.flatMap(elemMatcher.match))

  const markedForDeletion = elemMatcher
    .exportMarkedForDeletion()
  const pregenMngr = pregenManager(
    generatedValues,
    uniqConstraints,
    elemMatcher.exportValueSets(),
    elemMatcher.exportEvaluators()
  )
  const exp = expander(pregenMngr)

  const elementsExpanded = elementsMatched
    .map(set => set.flatMap(exp.expand))

  const [
    elementsFiltered,
    setToShuffles,
  ] = filterElements(elementsExpanded, markedForDeletion)

  return [
    elementsFiltered,
    pregenMngr.exportGeneratedValues(),
    pregenMngr.exportUniqConstraints(),
    elemMatcher.exportValueSets(),
    elemMatcher.exportStatements(),
    elemMatcher.exportYanks(),
    ss.exportStyleDefinitions(),
    setToShuffles,
  ]
}

export default process
