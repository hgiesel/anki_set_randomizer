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

export function main(
  frontside,
  inputSyntax,
  defaultStyle,
  originalStructureInherited,
  generatorValuesInherited,
  reordersInherited,
  reordersSecondInherited,
  randomIndicesInherited,
) {
  const form = formatter(inputSyntax)
  const originalStructure = form.getOriginalStructure()

  if (form.isValid && (!frontside || !form.isContained) && originalStructure.length > 0) {

    const structureMatches = matchStructures(
      originalStructure,
      originalStructureInherited
    )

    //////////////////////////////////////////////////////////////////////////////
    // FIRST RANDOMIZATION
    const [
      numberedSets,
      generatorValues,
      valueSets,
    ] = processNumberedSets(
      originalStructure,
      matchGeneratorValues(
        matchStructures(originalStructure, originalStructureInherited),
        generatorValuesInherited,
      ),
    )

    const namedSets        = processNamedSets(originalStructure)
    const orderConstraints = processOrderConstraints(originalStructure, namedSets)

    // modifies numberedSets and namedSets
    adjustForSecondRandomization(orderConstraints, numberedSets, namedSets)

    const commands = processCommands(originalStructure, numberedSets, namedSets)

    const [
      styleDefinitions,
      styleAssignments,
      styleRules,
    ] = processRenderDirectives(originalStructure, defaultStyle, namedSets)

    const [elements, reordersAlpha] = generateRandomization(numberedSets, namedSets)

    const reorders = applyInheritedSetReorder(
      reordersAlpha,
      reordersInherited,
      structureMatches,
    )

    applyModifications(reorders, elements, orderConstraints, commands)

    //////////////////////////////////////////////////////////////////////////////
    // SECOND RANDOMIZATION
    const [numberedSetsSecond, _] = processNumberedSets(
      elements.map(set => set.filter(elem => elem[3] !== 'd')),
      [],
    )

    const [elementsSecond, reordersSecondAlpha] = generateRandomization(
      numberedSetsSecond
        .map((v, i) => ({
          name: v.name,
          elements: v.elements,
          lastMinute: numberedSets[i].lastMinute
        })),
      namedSets,
    )

    const reordersSecond = applyInheritedSetReorder(
      reordersSecondAlpha,
      reordersSecondInherited,
      structureMatches,
    )

    alert(JSON.stringify(reordersSecond))

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
      styleAssignments,
      styleRules,
      randomIndicesInherited,
      valueSets,
      numberedSets,
    )

    //////////////////////////////////////////////////////////////////////////////
    return [
      originalStructure,
      generatorValues,
      reorders,
      reordersSecond,
      randomIndices,
    ]
  }

  else {
    return [
      originalStructure,
      [/* generatorValues */],
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
