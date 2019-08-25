import formatter from './lib/formatter.js'

import {
  processNumberedSets,
  processSharedElementsGroups,
  processSharedOrderGroups,
  processRenderDirectives,
  processCommands,
} from './lib/processor.js'

import {
  applyCommand,
  applySetReorder,
} from './lib/sort.js'

import {
  generateRandomization,
} from './lib/randomize.js'

import {
  escapeHtml,
} from './lib/util.js'

import {
  reorderForRendering,
} from './lib/matching.js'

if (window.Persistence && Persistence.isAvailable()) {
  mainFront()
}

function mainFront() {

  const inputSyntax = {
    query: $$query,
    openDelim: $$input_syntax_open_delim,
    closeDelim: $$input_syntax_close_delim,
    fieldSeparator: $$input_syntax_field_separator,
  }

  const defaultStyle = {
    colors: $$colors,
    collectiveIndexing: $$colors_collective_indexing,
    randomStartIndex: $$colors_random_start_index,

    fieldPadding: $$field_padding,
    openDelim: $$output_syntax_open_delim,
    closeDelim: $$output_syntax_close_delim,
    fieldSeparator: $$output_syntax_field_separator,
    emptySet: $$output_syntax_empty_set,
  }

  const testQuery = document.querySelector(inputSyntax.query)

  // protect against invalid query or {{FrontSide}}
  if (!testQuery || !testQuery.innerHTML ||
      testQuery.innerHTML.includes('SET RANDOMIZER FRONT TEMPLATE') ||
      testQuery.innerHTML.includes('SET RANDOMIZER BACK TEMPLATE')) {
    return
  }

  const form = formatter(inputSyntax)
  const originalStructure = form.getOriginalStructure()

  if (originalStructure) {

    const [
      numberedSets,
      generatorValues,
    ] = processNumberedSets(originalStructure, [])

    const sharedElementsGroups = processSharedElementsGroups(originalStructure)
    const sharedOrderGroups    = processSharedOrderGroups(originalStructure, sharedElementsGroups)
    const commands             = processCommands(originalStructure, numberedSets, sharedElementsGroups)

    const [
      stylingDefinitions,
      stylingAssignments,
    ] = processRenderDirectives(originalStructure, defaultStyle, sharedElementsGroups)

    const [newElements, newElementsCopy, newReorders] = generateRandomization(
      numberedSets,
      sharedElementsGroups,
      sharedOrderGroups,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies newElementsCopy (!)
    newReorders
      .forEach(sr => applySetReorder(sr, newElements))

    //////////////////////////////////////////////////////////////////////////////
    commands
      // are applied last to first
      .sort((a, b) => {
        if (a[3] === b[3]) { return 0 }
        if (a[3] === 'c') { return -1 }
        if (a[3] === 'm' && b[3] === 'd') { return -1 }
        if (a[3] === 'm' && b[3] === 'c') { return 1 }
        if (a[3] === 'd') { return 1 }
      })
      .forEach(cmd => applyCommand(cmd, newElements)) // modifies newElements

    //////////////////////////////////////////////////////////////////////////////
    // LAST MINUTE
    const lastMinuteStructure = newElements
      .map(set => set.filter(elem => elem[3] !== 'd'))

    const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure, [])[0]
      .map((v, i) => ({
        name: v.name,
        elements: v.elements,
        lastMinute: numberedSets[i].lastMinute
      }))

    const [lastMinuteElements, lastMinuteElementsCopy, lastMinuteReorders] = generateRandomization(
      lastMinuteNumberedSets,
      sharedElementsGroups,
      sharedOrderGroups.filter(v => v.lastMinute),
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies elementsCopy (!)
    lastMinuteReorders
      .filter(v => v.lastMinute)
      .forEach(sr => applySetReorder(sr, lastMinuteElements, lastMinuteElementsCopy))

    //////////////////////////////////////////////////////////////////////////////
    const randomIndices = form.renderSets(
      reorderForRendering([], lastMinuteElements),
      stylingDefinitions,
      stylingAssignments,
      {}, // randomIndices
      numberedSets
    )

    //////////////////////////////////////////////////////////////////////////////
    Persistence.removeItem("AnkiSetRandomizerOriginalStructure")
    Persistence.removeItem("AnkiSetRandomizerInputSyntax")
    Persistence.removeItem("AnkiSetRandomizerDefaultStyle")
    Persistence.removeItem("AnkiSetRandomizerGeneratorValues")
    Persistence.removeItem("AnkiSetRandomizerNewReorders")
    Persistence.removeItem("AnkiSetRandomizerLastMinuteReorders")
    Persistence.removeItem("AnkiSetRandomizerRandomIndices")

    Persistence.setItem("AnkiSetRandomizerOriginalStructure", originalStructure)
    Persistence.setItem("AnkiSetRandomizerInputSyntax", inputSyntax)
    Persistence.setItem("AnkiSetRandomizerDefaultStyle", defaultStyle)
    Persistence.setItem("AnkiSetRandomizerGeneratorValues", generatorValues || [])
    Persistence.setItem("AnkiSetRandomizerNewReorders", newReorders || [])
    Persistence.setItem("AnkiSetRandomizerLastMinuteReorders", lastMinuteReorders || [])
    Persistence.setItem("AnkiSetRandomizerRandomIndices", randomIndices || [])
  }
}
