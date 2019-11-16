import structureMatcher from './matching.js'
import process from './processors/process.js'

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

  setToShufflesMap,
  shufflesOld,
  ordersOld,
  shufflesForcedOld,
  ordersForcedOld,

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
      generatedValues,
      uniquenessConstraints,
      valueSets,
      statements,
      yanks,
      styles,
      setToShuffles,
    ] = process(
      elementsOriginal,
      sm.matchGeneratedValues(generatedValuesOld),
      uniquenessConstraintsOld,
      defaultStyle,
    )

    setToShufflesMap[iterName] = setToShuffles

    const re = ruleEngine(
      uniquenessConstraints,
      setToShuffles,
      yanks,
    )

    re.lateEvaluate(elementsShuffle, iterName, ...statements)

    const [
      shuffles,
      orders,
    ] = randomize(
      elementsShuffle /* is modified */,
      sm.matchShuffles(setToShufflesMap, shufflesOld),
      ordersOld,
      ...re.exportRandomizationData(),
    )

    //////////////////////////////////////////////////////////////////////////////
    // FILTER DELETED + FORCING
    const [elementsForce] = process(elementsShuffle, [], [], defaultStyle)

    const [
      shufflesForced,
      ordersForced,
    ] = randomize(
      elementsForce /* is modified */,
      sm.matchShuffles(shufflesForcedOld, setToShufflesMap),
      ordersForcedOld,
      ...re.exportRandomizationData(true),
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = render(
      form,
      sm.reorderForRendering(elementsForce),
      valueSets,
      yanks,
      styles,
      re.getStyleApplications(elementsForce),
      randomIndicesOld,
      elementsShuffle,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [[
      sm.exportElements(),
      generatedValues,
      uniquenessConstraints,

      setToShufflesMap,
      sm.mergeShuffles(setToShufflesMap, shuffles, shufflesOld),
      orders,
      sm.mergeShuffles(setToShufflesMap, shufflesForced, shufflesForcedOld),
      ordersForced,

      randomIndices,
    ], true]
  }

  else {
    return [[
      elementsOld,
      generatedValuesOld,
      uniquenessConstraintsOld,

      setToShufflesMap,
      shufflesOld,
      ordersOld,
      shufflesForcedOld,
      ordersForcedOld,

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
