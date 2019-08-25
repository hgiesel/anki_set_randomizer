import formatter from './lib/formatter.js'

import {
  processNumberedSets,
  processSharedElementsGroups,
  processSharedOrderGroups,
  processRenderDirectives,
  processCommands,
} from './lib/processor.js'

import {
  generateRandomization,
} from './lib/randomize.js'

import {
  matchStructures,
  matchGeneratorValues,
  reorderForRendering,
} from './lib/matching.js'

import {
  applyCommand,
  applySetReorder,
  applyInheritedSetReorder,
} from './lib/sort.js'

import {
  applySharedOrder
} from './lib/reorder.js'

import {
  escapeHtml,
} from './lib/util.js'

if (window.Persistence && Persistence.isAvailable()) {
  mainBack()
}

function mainBack() {
  const inheritedOriginalStructure  = Persistence.getItem("AnkiSetRandomizerOriginalStructure")
  const inheritedInputSyntax        = Persistence.getItem("AnkiSetRandomizerInputSyntax")
  const inheritedDefaultStyle       = Persistence.getItem("AnkiSetRandomizerDefaultStyle")
  const inheritedGeneratorValues    = Persistence.getItem("AnkiSetRandomizerGeneratorValues")
  const inheritedNewReorders        = Persistence.getItem("AnkiSetRandomizerNewReorders")
  const inheritedLastMinuteReorders = Persistence.getItem("AnkiSetRandomizerLastMinuteReorders")
  const inheritedRandomIndices      = Persistence.getItem("AnkiSetRandomizerRandomIndices")

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

    const [newElements, newElementsCopy, newReorders] = generateRandomization(
      numberedSets,
      sharedElementsGroups,
      sharedOrderGroups,
    )

    const modifiedReorders = applyInheritedSetReorder(
      newReorders,
      inheritedNewReorders,
      structureMatches,
    )

    // modifies modifiedReorders (!)
    sharedOrderGroups.forEach(sog => applySharedOrder(sog, modifiedReorders))

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies newElementsCopy (!)
    modifiedReorders
      .forEach(sr => applySetReorder(sr, newElements))

    //////////////////////////////////////////////////////////////////////////////
    // COMMANDS
    commands
      .sort((a, b) => {
        if (a[3] === b[3]) { return 0 }
        if (a[3] === 'c') { return -1 }
        if (a[3] === 'm' && b[3] === 'd') { return -1 }
        if (a[3] === 'm' && b[3] === 'c') { return 1 }
        if (a[3] === 'd') { return 1 }
      })
      .forEach(cmd => applyCommand(cmd, newElements)) // modifies newElements

    //////////////////////////////////////////////////////////////////////////////
    const lastMinuteStructure = newElements
      .map(set => set.filter(elem => elem[3] !== 'd'))

    const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure, [])[0]
      .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}))

    const lastMinuteSharedOrderGroups = sharedOrderGroups.filter(v => v.lastMinute)

    const [lastMinuteElements, lastMinuteElementsCopy, lastMinuteReorders] = generateRandomization(
      lastMinuteNumberedSets,
      sharedElementsGroups,
      lastMinuteSharedOrderGroups,
      true,
    )

    const modifiedLastMinuteReorders = applyInheritedSetReorder(
      lastMinuteReorders,
      inheritedLastMinuteReorders,
      structureMatches,
    )

    // modifies modifiesReorders (!)
    lastMinuteSharedOrderGroups.forEach(sog => applySharedOrder(sog, modifiedLastMinuteReorders))

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies elementsCopy (!)
    modifiedLastMinuteReorders
      .filter(v => v.lastMinute)
      .forEach(sr => applySetReorder(sr, lastMinuteElements, lastMinuteElementsCopy))

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
