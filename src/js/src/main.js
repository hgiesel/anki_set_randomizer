import formatter from './lib/formatter.js'

import {
  shareOrder,
} from './lib/randomize.js'

import {
  applySetReorder,
  applyCommands,
  applyInheritedSetReorder,
} from './lib/sort.js'

import {
  processNumberedSets,
} from './lib/processors/numbered.js'

import {
  processSharedElementsGroups,
  processSharedOrderGroups,
} from './lib/processors/randomization.js'

import {
  processRenderDirectives,
} from './lib/processors/stylings.js'

import {
  processCommands,
} from './lib/processors/commands.js'

import {
  generateRandomization,
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

    const [numberedSets, generatorValues] = processNumberedSets(
      originalStructure,
      matchGeneratorValues(
        matchStructures(originalStructure, originalStructureInherited),
        generatorValuesInherited,
      ),
    )

    const segs     = processSharedElementsGroups(originalStructure)
    const sogs     = processSharedOrderGroups(originalStructure, segs)
    const commands = processCommands(originalStructure, numberedSets, segs)
    const [
      stylingDefinitions,
      stylingAssignments,
    ] = processRenderDirectives(originalStructure, defaultStyle, segs)

    const [elements, reordersAlpha] = generateRandomization(numberedSets, segs)

    const reorders = applyInheritedSetReorder(
      reordersAlpha,
      reordersInherited,
      structureMatches,
    )

    applyModifications(reorders, elements, sogs, commands)

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
      segs,
    )

    const reordersSecond = applyInheritedSetReorder(
      reordersSecondAlpha,
      reordersSecondInherited,
      structureMatches,
    )

    applyModifications(
      reordersSecond.filter(v => v.lastMinute),
      elementsSecond,
      sogs.filter(v => v.lastMinute),
      [],
    )

    //////////////////////////////////////////////////////////////////////////////
    // RENDERING
    const randomIndices = form.renderSets(
      reorderForRendering(structureMatches, elementsSecond),
      stylingDefinitions,
      stylingAssignments,
      randomIndicesInherited,
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
function applyModifications(reorders, elements, sogs, commands) {

  // modifies reorders
  shareOrder(reorders, sogs)

  // both modify elements
  applySetReorder(reorders, elements)
  applyCommands(commands, elements)
}
