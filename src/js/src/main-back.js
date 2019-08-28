import formatter from './lib/formatter.js'

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
  matchStructures,
  matchGeneratorValues,
  reorderForRendering,
} from './lib/matching.js'

import {
  applyCommands,
  applySetReorder,
  applyInheritedSetReorder,
} from './lib/sort.js'

import {
  generateRandomization,
  shareOrder,
} from './lib/randomize.js'

import {
  escapeHtml,
} from './lib/util.js'

if (window.Persistence && Persistence.isAvailable()) {
  mainBack()
}

function mainBack() {
  const [
    inheritedOriginalStructure,
    inheritedInputSyntax,
    inheritedDefaultStyle,
    inheritedGeneratorValues,
    inheritedNewReorders,
    inheritedLastMinuteReorders,
    inheritedRandomIndices,
  ] = Persistence.getItem("SRdata")

  // invalid FrontSide will cause an invalid BackSide
  if (
    !inheritedOriginalStructure ||
    !inheritedInputSyntax ||
    !inheritedDefaultStyle ||
    !inheritedGeneratorValues ||
    !inheritedNewReorders ||
    !inheritedLastMinuteReorders ||
    !inheritedRandomIndices
  ) {
    return
  }

  const form = formatter(inheritedInputSyntax)
  const originalStructure = form.getOriginalStructure()

  if (originalStructure) {

    const structureMatches = matchStructures(originalStructure, inheritedOriginalStructure)

    const [numberedSets, _]    = processNumberedSets(originalStructure, matchGeneratorValues(structureMatches, inheritedGeneratorValues))
    const sharedElementsGroups = processSharedElementsGroups(originalStructure)
    const sharedOrderGroups    = processSharedOrderGroups(originalStructure, sharedElementsGroups)
    const commands             = processCommands(originalStructure, numberedSets, sharedElementsGroups)

    const [
      stylingDefinitions,
      stylingAssignments,
    ] = processRenderDirectives(originalStructure, inheritedDefaultStyle, sharedElementsGroups)

    const [newElements, newReorders] = generateRandomization(
      numberedSets,
      sharedElementsGroups,
    )

    // will require sharedOrderGroups...
    // I don't know how it should otherwise be calculated
    const modifiedReorders = applyInheritedSetReorder(
      newReorders,
      inheritedNewReorders,
      structureMatches,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies reorders (!)
    shareOrder(modifiedReorders, sharedOrderGroups)
    applySetReorder(modifiedReorders, newElements)
    applyCommands(commands, newElements) // modifies newElements

    //////////////////////////////////////////////////////////////////////////////
    const lastMinuteStructure = newElements
      .map(set => set.filter(elem => elem[3] !== 'd'))

    const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure, [])[0]
      .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}))

    const lastMinuteSharedOrderGroups = sharedOrderGroups
      .filter(v => v.lastMinute)

    const [lastMinuteElements, lastMinuteReorders] = generateRandomization(
      lastMinuteNumberedSets,
      sharedElementsGroups,
    )

    const modifiedLastMinuteReorders = applyInheritedSetReorder(
      lastMinuteReorders,
      inheritedLastMinuteReorders,
      structureMatches,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies reorders (!)
    shareOrder(modifiedLastMinuteReorders, lastMinuteSharedOrderGroups)
    applySetReorder(
      modifiedLastMinuteReorders
        .filter(v => v.lastMinute),
      lastMinuteElements
    )

    //////////////////////////////////////////////////////////////////////////////
    form.renderSets(
      reorderForRendering(structureMatches, lastMinuteElements),
      stylingDefinitions,
      stylingAssignments,
      inheritedRandomIndices,
      numberedSets,
    )
  }
}
