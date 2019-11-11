import structureMatcher from './matching.js'
import process from './processors/process.js'

import lateEvaluate from './lateEvaluation/lateEvaluation.js'
import ruleEngine from './lateEvaluation/ruleEngine'

import randomize from './randomize/randomize.js'

import render from './render/render.js'
import formatter from './render/formatter.js'

//////////////////////////////////////////////////////////////////////////////
// elementsOld + elementsOriginal -> elementsShuffle -> elementsForce
// [['iter', 0, 0, 'Hello', 'n'],['iter', 0, 1, 'World'],[]],[[],[]], etc.]
// namedSets [{iter, name, sets, force}]
// reordersShuffle -> reordersShuffle [{iter, name, order}]
const main2 = function(
  iterName,
  inputSyntax,
  defaultStyle,

  elementsOld,
  generatedValuesOld,
  uniquenessConstraintsOld,
  reordersShuffleOld,
  reordersForceOld,
  randomIndicesOld,

  injections,
) {
  const form = formatter(inputSyntax, injections, iterName)
  const elementsOriginal = form.getElementsOriginal()

  if (!form.isInvalid() /* && !form.isContained() */ && elementsOriginal.length > 0) {
    const sm = structureMatcher(elementsOriginal, elementsOld, iterName)

    //////////////////////////////////////////////////////////////////////////////
    // SHUFFLING
    const [
      elementsShuffle,
      yanks,
      generatedValues,
      uniquenessConstraints,
      valueSets,
      lateEvaluation,
    ] = process(
      elementsOriginal,
      sm.matchGeneratedValues(generatedValuesOld),
      uniquenessConstraintsOld,
      iterName,
    )

    const re = ruleEngine(
      elementsShuffle,
      yanks,
      defaultStyle,
      iterName
    )
    lateEvaluate(re, ...lateEvaluation)

    const reordersShuffle = randomize(
      elementsShuffle /* is modified */,
      sm.reorderMatcher(reordersShuffleOld),
      ...re.exportRandomizationData(),
    )

    //////////////////////////////////////////////////////////////////////////////
    // FILTER DELETED + FORCING
    const [elementsForce] = process(elementsShuffle, [], [], iterName)

    const reordersForce = randomize(
      elementsForce /* is modified */,
      sm.reorderMatcher(reordersForceOld),
      ...re.exportRandomizationData(true),
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = render(
      form,
      sm.reorderForRendering(elementsForce),
      valueSets,
      yanks,
      ...re.exportStyleData(),
      randomIndicesOld,
      elementsShuffle,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [[
      sm.mergeElements(),
      generatedValues,
      uniquenessConstraints,
      reordersShuffleOld.concat(reordersShuffle),
      reordersForceOld.concat(reordersForce),
      randomIndices,
    ], true]
  }

  else {
    return [[
      elementsOld,
      generatedValuesOld,
      uniquenessConstraintsOld,
      reordersShuffleOld,
      reordersForceOld,
      randomIndicesOld,
    ], false]
  }
}

export const main = function(iterations, injectionsParsed, saveDataOld) {
  // frontside will be run with indices (-1, -2, -3, etc...)
  // backside will be run with indices (+1, +2, +3, etc...)
  // but technically they are run in a row
  const saveDataAndSetsUsed = iterations
    .reduce((accu, v, i) => {
      const [
        saveDataNew,
        wereSetsUsed,
      ] = main2(
        v.name,
        v.inputSyntax,
        v.defaultStyle,
        ...accu[0],
        injectionsParsed[i],
      )

      return [saveDataNew, wereSetsUsed || accu[1]]
    }, [
      saveDataOld,
      false /* no sets used is assumption */
    ])

  return saveDataAndSetsUsed
}
