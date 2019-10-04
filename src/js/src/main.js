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
  matchGeneratorValues,
  reorderForRendering,
} from './lib/matching.js'

export function main(options, saveDataOld, frontside) {

  const saveData = options
    .reduce((accu, v) => main2(
      frontside,
      v.inputSyntax,
      v.defaultStyle,
      ...accu,
    ), saveDataOld)

  return saveData
}

//////////////////////////////////////////////////////////////////////////////
// elementsInherited + elementsOriginal -> elementsFirst -> elementsSecond
// [[0,0,'Hello','n'],[0,1,'World'],[]],[[],[]], etc.]

// numberedSets -> numberedSetsSecond

// reorders -> reordersSecond
// [{name:1/name, length, sets, setLengths, order, lastMinute}]
function main2(
  frontside,
  inputSyntax,
  defaultStyle,

  elementsInherited,
  generatorValuesInherited,
  reordersInherited,
  reordersSecondInherited,
  randomIndicesInherited,
) {
  const form = formatter(inputSyntax)
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
      generatorValues,
      valueSets,
    ] = processNumberedSets(
      elementsOriginal,
      matchGeneratorValues(structureMatches, generatorValuesInherited),
      [],
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

    const [elementsFirst, reordersAlpha] = generateRandomization(numberedSets, namedSets)

    const reorders = applyInheritedSetReorder(
      reordersAlpha,
      reordersInherited,
      structureMatches,
    )

    applyModifications(reorders, elementsFirst, orderConstraints, commands)


    //////////////////////////////////////////////////////////////////////////////
    // SECOND RANDOMIZATION

    const [numberedSetsSecond, _1, _2] = processNumberedSets(
      elementsFirst.map(set => set.filter(elem => elem[3] !== 'd')),
      [],
      numberedSets.map(set => set.lastMinute),
    )

    const [elementsSecond, reordersSecondAlpha] = generateRandomization(
      numberedSetsSecond,
      namedSets,
    )

    const reordersSecond = applyInheritedSetReorder(
      reordersSecondAlpha,
      reordersSecondInherited,
      structureMatches,
    )

    applyModifications(
      reordersSecond.filter(v => v.lastMinute),
      elementsSecond,
      orderConstraints.filter(v => v.lastMinute),
      [],
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = form.renderSets(
      reorderForRendering(structureMatches, elementsSecond),
      styleDefinitions,
      styleApplications,
      styleRules,
      randomIndicesInherited,
      valueSets,
      numberedSets,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [
      elementsOriginal,
      generatorValues,
      reorders,
      reordersSecond,
      randomIndices,
    ]
  }

  else {
    return [
      elementsOriginal,
      [/* generatedValues */],
      [/* reorders */],
      [/* reordersSecond */],
      {/* randomIndices */},
    ]
  }
}

// numbered are sorted 0 -> n, then named are in order of appearance
function applyModifications(reorders, elements, orderConstraints, commands) {

  // modifies reorders
  shareOrder(reorders, orderConstraints)

  // both modify elements
  applySetReorder(reorders, elements)
  applyCommands(commands, elements)
}
