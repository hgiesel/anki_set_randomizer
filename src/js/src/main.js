import formatter from './lib/formatter.js'

import {
  applySetReorder,
  applyCommands,
  applyInheritedSetReorder,
} from './lib/sort.js'

import {
  processNumberedSets,
} from './lib/processors/numbered.js'

import {
  processNamedSets,
  processOrderConstraints,
} from './lib/processors/randomization.js'

import {
  processRenderDirectives,
} from './lib/processors/stylings.js'

import {
  processCommands,
} from './lib/processors/commands.js'

import {
  shareOrder,
  generateRandomization,
  adjustForSecondRandomization,
} from './lib/randomize.js'

import {
  matchStructures,
  matchGeneratedValues,
  reorderForRendering,
} from './lib/matching.js'

export function main(options, saveDataOld, frontside) {

  // frontside will be run with indices (1, 2, 3, etc...)
  // backside will be run with indices (-1, -2, -3, etc...)
  // but technically they are run in a row
  const saveData = options
    .reduce((accu, v, iterIndex) => main2(
      frontside ? (iterIndex + 1) : (-iterIndex - 1),
      frontside,
      v.inputSyntax,
      v.defaultStyle,
      ...accu,
    ), saveDataOld)

  console.log('saveData', saveData)
  return saveData
}

//////////////////////////////////////////////////////////////////////////////
// elementsInherited + elementsOriginal -> elementsFirst -> elementsSecond
// [[0,0,'Hello','n'],[0,1,'World'],[]],[[],[]], etc.]

// numberedSets -> numberedSetsSecond

// reorders -> reordersSecond
// [{name:1/name, length, sets, setLengths, order, lastMinute}]
function main2(
  iterIndex,
  frontside,
  inputSyntax,
  defaultStyle,

  elementsInherited,
  generatedValuesInherited,
  uniquenessConstraintsInherited,
  reordersFirstInherited,
  reordersSecondInherited,
  randomIndicesInherited,
) {
  const form = formatter(inputSyntax, iterIndex)
  const elementsOriginal = form.getElementsOriginal()

  if (form.isValid && (!frontside || !form.isContained) && elementsOriginal.length > 0) {

    const structureMatches = matchStructures(
      elementsOriginal,
      elementsInherited,
    )

    //////////////////////////////////////////////////////////////////////////////
    // FIRST RANDOMIZATION
    const [
      numberedSets,
      generatedValues,
      uniquenessConstraints,
      valueSets,
    ] = processNumberedSets(
      elementsOriginal,
      matchGeneratedValues(structureMatches, generatedValuesInherited),
      uniquenessConstraintsInherited,
      iterIndex,
    )

    const namedSets        = processNamedSets(elementsOriginal)
    const orderConstraints = processOrderConstraints(elementsOriginal, namedSets)

    // modifies numberedSets and namedSets
    adjustForSecondRandomization(orderConstraints, numberedSets, namedSets)

    const commands = processCommands(elementsOriginal, numberedSets, namedSets)

    const [
      styleDefinitions,
      styleApplications,
      styleRules,
    ] = processRenderDirectives(elementsOriginal, defaultStyle, namedSets)

    const [
      reordersFirst,
      elementsFirst,
    ] = applyModifications(
      numberedSets,
      namedSets,
      orderConstraints,
      commands,
      reordersFirstInherited,
      structureMatches,
    )

    //////////////////////////////////////////////////////////////////////////////
    // SECOND RANDOMIZATION

    const [numberedSetsSecond, _1, _2, _3] = processNumberedSets(
      elementsFirst.map(set => set.filter(elem => elem[4] !== 'd')),
      [],
      [],
      iterIndex,
      numberedSets.map(set => set.lastMinute),
    )

    const [
      reordersSecond,
      elementsSecond,
    ] = applyModifications(
      numberedSetsSecond,
      namedSets.filter(v => v.lastMinute),
      orderConstraints.filter(v => v.lastMinute),
      [],
      reordersSecondInherited,
      structureMatches,
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = form.renderSets(
      reorderForRendering(structureMatches, elementsSecond, iterIndex),
      styleDefinitions,
      styleApplications,
      styleRules,
      randomIndicesInherited,
      valueSets,
      numberedSets,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [
      elementsInherited.concat(elementsOriginal.filter(v => !structureMatches.find(w => w.to[0] === v[0][0] && w.to[1] === v[0][1]))),
      generatedValues,
      uniquenessConstraints,
      reordersFirstInherited.concat(reordersFirst),
      reordersSecondInherited.concat(reordersSecond),
      randomIndices,
    ]
  }

  else {
    return [
      elementsInherited,
      generatedValuesInherited,
      uniquenessConstraintsInherited,
      reordersFirstInherited,
      reordersSecondInherited,
      randomIndicesInherited,
    ]
  }
}

// numbered are sorted 0 -> n, then named are in order of appearance
function applyModifications(numberedSets, namedSets, orderConstraints, commands, reordersInherited, structureMatches) {

  const [elements, reordersAlpha] = generateRandomization(numberedSets, namedSets)

  const reorders = applyInheritedSetReorder(
    reordersAlpha,
    reordersInherited,
    structureMatches,
  )

  // modifies reorders
  shareOrder(orderConstraints, reorders)

  // both modify elements
  applySetReorder(reorders, elements)
  applyCommands(commands, elements)

  return [
    reorders,
    elements,
  ]
}
