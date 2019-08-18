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

if (window.Persistence && Persistence.isAvailable()) {
  mainFront()
}

function mainFront() {

  const options = {
    query: $$query,
    colors: $$colors,
    colors_collective_indexing: $$colors_collective_indexing,
    colors_random_start_index: $$colors_random_start_index,
    fieldPadding: $$field_padding,
    inputSyntax: {
      openDelim: $$input_syntax_open_delim,
      closeDelim: $$input_syntax_close_delim,
      fieldSeparator: $$input_syntax_field_separator,
    },
    outputSyntax: {
      openDelim: $$output_syntax_open_delim,
      closeDelim: $$output_syntax_close_delim,
      fieldSeparator: $$output_syntax_field_separator,
      emptySet: $$output_syntax_empty_set,
    }
  }

  const testQuery = document.querySelector(options.query)

  // protect against invalid query or {{FrontSide}}
  if (!testQuery || !testQuery.innerHTML ||
      testQuery.innerHTML.includes('SET RANDOMIZER FRONT TEMPLATE') ||
      testQuery.innerHTML.includes('SET RANDOMIZER BACK TEMPLATE')) {
    return
  }

  const form = formatter(options)
  const originalStructure = form.getOriginalStructure()

  if (originalStructure) {

    const [
      numberedSets,
      generatorValues,
    ] = processNumberedSets(originalStructure, [])

    const sharedElementsGroups = processSharedElementsGroups(originalStructure)
    const sharedOrderGroups    = processSharedOrderGroups(originalStructure)

    const [newElements, newElementsCopy, newReorders] = generateRandomization(
      numberedSets,
      sharedElementsGroups,
      sharedOrderGroups,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies newElementsCopy (!)
    newReorders
      .forEach(sr => applySetReorder(sr, newElements, newElementsCopy))

    //////////////////////////////////////////////////////////////////////////////
    // COMMANDS
    // are applied last to first
    const commands = processCommands(originalStructure, numberedSets, sharedElementsGroups)
      .sort((a, b) => {
        if (a[3] === b[3]) { return 0 }
        if (a[3] === 'c') { return -1 }
        if (a[3] === 'm' && b[3] === 'd') { return -1 }
        if (a[3] === 'm' && b[3] === 'c') { return 1 }
        if (a[3] === 'd') { return 1 }
      })

    // modifies newElements
    commands.forEach(cmd => applyCommand(cmd, newElements))

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
    const renderDirectives = processRenderDirectives(originalStructure, sharedElementsGroups)

    const randomIndices = new Array(lastMinuteElements.length)
      .fill(0).map(_ => Math.random())

    form.renderSets(
      lastMinuteElements
      // import for collective color indexing
      .map((v, i) => ({rendering: v, order: i})), renderDirectives, randomIndices, numberedSets)

    //////////////////////////////////////////////////////////////////////////////
    Persistence.removeItem("AnkiSetRandomizerOriginalStructure")
    Persistence.removeItem("AnkiSetRandomizerOptions")
    Persistence.removeItem("AnkiSetRandomizerGeneratorValues")
    Persistence.removeItem("AnkiSetRandomizerNewReorders")
    Persistence.removeItem("AnkiSetRandomizerLastMinuteReorders")
    Persistence.removeItem("AnkiSetRandomizerRandomIndices")

    Persistence.setItem("AnkiSetRandomizerOptions", options)
    Persistence.setItem("AnkiSetRandomizerOriginalStructure", originalStructure)
    Persistence.setItem("AnkiSetRandomizerGeneratorValues", generatorValues || [])
    Persistence.setItem("AnkiSetRandomizerNewReorders", newReorders || [])
    Persistence.setItem("AnkiSetRandomizerLastMinuteReorders", lastMinuteReorders || [])
    Persistence.setItem("AnkiSetRandomizerRandomIndices", randomIndices || [])
  }
}
