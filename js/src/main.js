import render from './render/render.js'
import formatter from './render/formatter.js'
import process from './processors/process.js'
import lateEvaluate from './lateEvaluation/lateEvaluation.js'
import randomize from './randomize/randomize.js'

import {
  matchStructures,
  matchGeneratedValues,
  reorderForRendering,
} from './randomize/matching.js'

//////////////////////////////////////////////////////////////////////////////
// elementsInherited + elementsOriginal -> elementsFirst -> elementsSecond
// [['iter',0,0,'Hello','n'],['iter',0,1,'World'],[]],[[],[]], etc.]
// numberedSets -> numberedSetsSecond
// reorders -> reordersSecond [{name:1/name, length, sets, setLengths, order, lastMinute}]
const main2 = function(
  iterName,
  inputSyntax,
  defaultStyle,

  elementsInherited,
  generatedValuesInherited,
  uniquenessConstraintsInherited,
  reordersFirstInherited,
  reordersSecondInherited,
  randomIndicesInherited,

  injections,
) {
  console.log('before formatting -1')

  const form = formatter(inputSyntax, injections, iterName)
  const elementsOriginal = form.getElementsOriginal()

  if (!form.isInvalid() /* && !form.isContained() */ && elementsOriginal.length > 0) {
    const structureMatches = matchStructures(elementsInherited, elementsOriginal)

    console.log('after matching // before processing 0')

    //////////////////////////////////////////////////////////////////////////////
    // FIRST RANDOMIZATION
    const [
      numberedSets,
      yanks,
      generatedValues,
      uniquenessConstraints,
      valueSets,
      lateEvaluation,
    ] = process(
      elementsOriginal,
      matchGeneratedValues(structureMatches, generatedValuesInherited),
      uniquenessConstraintsInherited,
      iterName,
    )

    const [
      namedSets,
      orderConstraints,
      commands,
      styleDefinitions,
      styleApplications,
    ] = lateEvaluate(numberedSets, defaultStyle, ...lateEvaluation)

    console.log('after lateEvaluate // before randomize 2', namedSets)

    const [
      reordersFirst,
      elementsFirst,
    ] = randomize(
      numberedSets,
      namedSets,
      orderConstraints,
      commands,
      reordersFirstInherited,
      structureMatches,
    )

    //////////////////////////////////////////////////////////////////////////////
    // SECOND RANDOMIZATION
    const [numberedSetsSecond] = process(
      elementsFirst,
      [],
      [],
      iterName,
    )

    const [
      reordersSecond,
      elementsSecond,
    ] = randomize(
      numberedSetsSecond,
      namedSets.filter(v => v.force),
      orderConstraints.filter(v => v.force),
      [],
      reordersSecondInherited,
      structureMatches,
      true,
    )

    console.log('before renderSets', numberedSetsSecond, elementsFirst)

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = render(
      form,
      numberedSets,
      reorderForRendering(structureMatches, elementsSecond, iterName),
      valueSets,
      yanks,
      styleDefinitions,
      styleApplications,
      randomIndicesInherited,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [[
      elementsInherited.concat(elementsOriginal.filter(v => !structureMatches.find(w => w.to[0] === v[0][0] && w.to[1] === v[0][1]))),
      generatedValues,
      uniquenessConstraints,
      reordersFirstInherited.concat(reordersFirst),
      reordersSecondInherited.concat(reordersSecond),
      randomIndices,
    ], true]
  }

  else {
    return [[
      elementsInherited,
      generatedValuesInherited,
      uniquenessConstraintsInherited,
      reordersFirstInherited,
      reordersSecondInherited,
      randomIndicesInherited,
    ], false]
  }
}

export const main = function(iterations, injectionsParsed, saveDataOld) {
  // frontside will be run with indices (-1, -2, -3, etc...)
  // backside will be run with indices (+1, +2, +3, etc...)
  // but technically they are run in a row
  console.log('before main -2')

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
