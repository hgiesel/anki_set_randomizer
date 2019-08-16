import formatter from './lib/formatter.js'

import {
  processNumberedSets,
  processElementSharingSets,
  processOrderSharingSets,
  processCommands,
} from './lib/processor.js'

import {
  generateRandomization,
} from './lib/randomize.js'

import {
  matchStructures,
  matchGeneratorValues,
  matchRandomIndices,
} from './lib/matching.js'

import {
  applyCommand,
  applySetReorder,
  applyInheritedSetReorder,
} from './lib/sort.js'

import {
  escapeHtml,
} from './lib/util.js'


if (window.Persistence && Persistence.isAvailable()) {
  mainBack()
}

function mainBack() {
  const inheritedOriginalStructure  = Persistence.getItem("AnkiSetRandomizerOriginalStructure")
  const inheritedOptions            = Persistence.getItem("AnkiSetRandomizerOptions")
  const inheritedGeneratorValues    = Persistence.getItem("AnkiSetRandomizerGeneratorValues")
  const inheritedNewReorders        = Persistence.getItem("AnkiSetRandomizerNewReorders")
  const inheritedLastMinuteReorders = Persistence.getItem("AnkiSetRandomizerLastMinuteReorders")
  const inheritedRandomIndices      = Persistence.getItem("AnkiSetRandomizerRandomIndices")

  // invalid FrontSide will cause an invalid BackSide
  if (
    !inheritedOriginalStructure ||
    !inheritedOptions ||
    !inheritedGeneratorValues ||
    !inheritedNewReorders ||
    !inheritedLastMinuteReorders ||
    !inheritedRandomIndices
  ) {
    return
  }

  const form = formatter(inheritedOptions)
  const originalStructure = form.getOriginalStructure()

  if (originalStructure) {

    const structureMatches = matchStructures(originalStructure, inheritedOriginalStructure)

    const [numberedSets, _]  = processNumberedSets(originalStructure, matchGeneratorValues(structureMatches, inheritedGeneratorValues))
    const elementSharingSets = processElementSharingSets(originalStructure)
    const orderSharingSets   = processOrderSharingSets(originalStructure)

    const [newElements, newElementsCopy, newReorders] = generateRandomization(
      numberedSets,
      elementSharingSets,
      orderSharingSets,
    )

    const modifiedReorders = applyInheritedSetReorder(
      newReorders,
      inheritedNewReorders,
      structureMatches,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies newElementsCopy (!)
    modifiedReorders
      .forEach(sr => applySetReorder(sr, newElements, newElementsCopy))

    //////////////////////////////////////////////////////////////////////////////
    // COMMANDS
    // are applied last to first
    const commands = processCommands(originalStructure)

    const reversedCommands = commands.reverse()
    const sortedReversedCommands = [
      reversedCommands.filter(v => v[3] === 'm'),
      reversedCommands.filter(v => v[3] === 'c'),
      reversedCommands.filter(v => v[3] === 'd'),
    ].flat()

    // modifies newElements
    sortedReversedCommands
      .forEach(cmd => applyCommand(cmd, newElements))

    //////////////////////////////////////////////////////////////////////////////
    const lastMinuteStructure = newElements
      .map(set => set.filter(elem => elem[3] !== 'd'))

    const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure, [])[0]
      .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}))

    const [lastMinuteElements, lastMinuteElementsCopy, lastMinuteReorders] = generateRandomization(
      lastMinuteNumberedSets,
      elementSharingSets,
      orderSharingSets.filter(v => v.lastMinute),
      true,
    )

    const modifiedLastMinuteReorders = applyInheritedSetReorder(
      lastMinuteReorders,
      inheritedLastMinuteReorders,
      structureMatches,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies elementsCopy (!)
    modifiedLastMinuteReorders
      .filter(v => v.lastMinute)
      .forEach(sr => applySetReorder(sr, lastMinuteElements, lastMinuteElementsCopy))

    //////////////////////////////////////////////////////////////////////////////
    form.renderSets(
      lastMinuteElements
      // import for collective color indexing
      .map((v, i) => ({rendering: v, order: i})), matchRandomIndices(
        structureMatches,
        matchRandomIndices(structureMatches, inheritedRandomIndices)
      )
    )
  }
}
