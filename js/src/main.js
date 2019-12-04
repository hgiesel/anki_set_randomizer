import structureMatcher from './matching.js'

import process from './processors/process.js'
import postprocess from './processors/postprocess.js'

import ruleEngine from './ruleEngine/ruleEngine.js'
import randomize from './randomize/randomize.js'

import applyCommands from './commands/commands.js'

import render from './render/render.js'
import formatter from './render/formatter.js'

//////////////////////////////////////////////////////////////////////////////
// elementsOld + elementsOriginal -> elementsShuffle -> elementsCmds
// [['iter', 0, 0, 'Hello', 'n'],['iter', 0, 1, 'World'],[]],[[],[]], etc.]
// namedSets [{iter, name, sets, force}]
// reordersShuffle -> reordersShuffle [{iter, name, order}]
const main2 = function(
  iterName,
  inputSyntax,
  defaultStyle,
  injections,

  elementsOld,
  generatedValuesOld,
  uniquenessConstraintsOld,

  setToShufflesMap,
  shufflesOld,
  ordersOld,

  randomIndicesOld,
) {
  const form = formatter(inputSyntax, injections, iterName)
  const elementsOriginal = form.getElementsOriginal()

  if (!form.isInvalid() && elementsOriginal.length > 0) {
    const sm = structureMatcher(elementsOriginal, elementsOld, iterName)

    //////////////////////////////////////////////////////////////////////////////
    // GENERATION
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
      iterName,
      ...statements,
    )

    //////////////////////////////////////////////////////////////////////////////
    // SHUFFLING
    const [
      shuffles,
      orders,
    ] = randomize(
      elementsShuffle /* is modified */,
      sm.matchShuffles(setToShufflesMap, shufflesOld),
      ordersOld,
      ...re.getRandomizationData(elementsShuffle),
    )

    //////////////////////////////////////////////////////////////////////////////
    // COMMANDS
    applyCommands(
      elementsShuffle,
      re.getCommands(elementsShuffle),
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const [
      events,
      randomIndices,
    ] = render(
      form,
      sm.reorderForRendering(elementsShuffle),
      valueSets,
      yanks,
      styles,
      re.getStyleApplications(elementsShuffle),
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

      randomIndices,
    ], events]
  }

  else {
    return [[
      elementsOld,
      generatedValuesOld,
      uniquenessConstraintsOld,

      setToShufflesMap,
      shufflesOld,
      ordersOld,

      randomIndicesOld,
    ], []]
  }
}

export const main = function(iterations, injectionsParsed, saveDataOld) {
  // frontside will be run with indices (-1, -2, -3, etc...)
  // backside will be run with indices (+1, +2, +3, etc...)
  // but technically they are run in a row
  const events = []
  const saveData = iterations
    .reduce((accu, v, i) => {
      const [
        saveDataNew,
        eventsInner,
      ] = main2(
        v.name,
        v.inputSyntax,
        v.defaultStyle,
        injectionsParsed[i],
        ...accu,
      )

      events.push(...eventsInner)

      return saveDataNew
    }, saveDataOld)

  events.forEach((ev) => {
    const tag = document.querySelector(ev.breadcrumb)
    if (tag) {
      tag.addEventListener(ev.event, ev.listener)
    }
  })

  return saveData
}
