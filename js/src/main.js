import structureMatcher from './matching.js'
import process from './processors/process.js'

import lateEvaluate from './lateEvaluation/lateEvaluation.js'
import ruleEngine from './lateEvaluation/ruleEngine'

import randomize from './randomize/randomize.js'

import render from './render/render.js'
import formatter from './render/formatter.js'

//////////////////////////////////////////////////////////////////////////////
// elementsOld + elementsOriginal -> elementsShuffled -> elementsForced
// [['iter', 0, 0, 'Hello', 'n'],['iter', 0, 1, 'World'],[]],[[],[]], etc.]
// numberedSets -> numberedSetsForced
// reorders -> reordersForced [{name:1/name, length, sets, setLengths, order, force}]
const main2 = function(
  iterName,
  inputSyntax,
  defaultStyle,

  elementsOld,
  generatedValuesOld,
  uniquenessConstraintsOld,
  reordersShuffledOld,
  reordersForcedOld,
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
      elementsToShuffle,
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
      elementsToShuffle,
      yanks,
      defaultStyle,
      iterName
    )
    lateEvaluate(re, ...lateEvaluation)

    const [
      reordersShuffled /* namedSets with mixed order fields */,
      elementsShuffled,
    ] = randomize(
      ...re.exportRandomizationData(),
      sm.reorderMatcher(reordersShuffledOld),
      elementsToShuffle,
    )

    //////////////////////////////////////////////////////////////////////////////
    // FILTER DELETED + FORCING
    const [elementsToForce] = process(elementsShuffled, [], [], iterName)

    const [
      reordersForced,
      elementsForced,
    ] = randomize(
      ...re.exportRandomizationData(true),
      sm.reorderMatcher(reordersForcedOld),
      elementsToForce,
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = render(
      form,
      sm.reorderForRendering(elementsForced),
      valueSets,
      yanks,
      ...re.exportStyleData(),
      randomIndicesOld,
      elementsToShuffle,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [[
      sm.mergeElements(),
      generatedValues,
      uniquenessConstraints,
      reordersShuffledOld.concat(reordersShuffled),
      reordersForcedOld.concat(reordersForced),
      randomIndices,
    ], true]
  }

  else {
    return [[
      elementsOld,
      generatedValuesOld,
      uniquenessConstraintsOld,
      reordersShuffledOld,
      reordersForcedOld,
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
