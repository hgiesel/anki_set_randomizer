import formatter from './formatter/formatter.js'
import process from './processors/process.js'
import lateEvaluate from './lateEvaluation/lateEvaluation.js'
import randomize from './randomize/randomize.js'

import {
  matchStructures,
  matchGeneratedValues,
  matchSetReorder,
  reorderForRendering,
} from './randomize/matching.js'

export function main(iterations, injectionsParsed, saveDataOld, frontside) {

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

//////////////////////////////////////////////////////////////////////////////
// elementsInherited + elementsOriginal -> elementsFirst -> elementsSecond
// [['iter',0,0,'Hello','n'],['iter',0,1,'World'],[]],[[],[]], etc.]
// numberedSets -> numberedSetsSecond
// reorders -> reordersSecond [{name:1/name, length, sets, setLengths, order, lastMinute}]

function main2(
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
  const form = formatter(inputSyntax, injections, iterName)
  const elementsOriginal = form.getElementsOriginal()

  if (!form.isInvalid() /* && !form.isContained() */ && elementsOriginal.length > 0) {

    const structureMatches = matchStructures(
      elementsInherited,
      elementsOriginal,
    )

    //////////////////////////////////////////////////////////////////////////////
    // FIRST RANDOMIZATION
    const [
      numberedSets,
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

    console.log('after processing // before lateEvaluate 1')

    const [
      namedSets,
      orderConstraints,
      commands,
      styleDefinitions,
      styleApplications,
    ] = lateEvaluate(
      numberedSets,
      defaultStyle,
      ...lateEvaluation,
    )

    console.log('after lateEvaluate // before randomize 2')

    // const namedSets        = processNamedSets(elementsOriginal)
    // const orderConstraints = processOrderConstraints(elementsOriginal, namedSets)

    // // modifies numberedSets and namedSets
    // adjustForSecondRandomization(orderConstraints, numberedSets, namedSets)

    // const commands = processCommands(elementsOriginal, numberedSets, namedSets)

    // const [
    //   styleDefinitions,
    //   styleApplications,
    //   styleRules,
    // ] = processRenderDirectives(elementsOriginal, defaultStyle, namedSets)

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
    const [numberedSetsSecond, _1, _2, _3] = process(
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
      namedSets.filter(v => v.lastMinute),
      orderConstraints.filter(v => v.lastMinute),
      [],
      reordersSecondInherited,
      structureMatches,
      true,
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = form.renderSets(
      reorderForRendering(structureMatches, elementsSecond, iterName),
      styleDefinitions,
      styleApplications,
      styleRules,
      randomIndicesInherited,
      valueSets,
      numberedSets,
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
