import styleSetter from './styleSetter.js'

import elementMatcher from './matchElem.js'

import pregenManager from './expand/pregen.js'
import expand from './expand/expand.js'

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
