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
  generateRandomization,
  shareOrder,
} from './lib/randomize.js'

import {
  applySetReorder,
  applyCommands,
} from './lib/sort.js'

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

    const [newElements, newReorders] = generateRandomization(
      numberedSets,
      sharedElementsGroups,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies newElementsCopy (!)
    shareOrder(newReorders, sharedOrderGroups)
    applySetReorder(newReorders, newElements)
    applyCommands(commands, newElements)

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

    const [lastMinuteElements, lastMinuteReorders] = generateRandomization(
      lastMinuteNumberedSets,
      sharedElementsGroups,
    )

    // numbered are sorted 0 -> n, then named are in order of appearance
    shareOrder(lastMinuteReorders, sharedOrderGroups.filter(v => v.lastMinute))
    applySetReorder(
      lastMinuteReorders
      .filter(v => v.lastMinute),
      lastMinuteElements
    )

    //////////////////////////////////////////////////////////////////////////////
    const randomIndices = form.renderSets(
      reorderForRendering([], lastMinuteElements),
      stylingDefinitions,
      stylingAssignments,
      {}, // randomIndices
      numberedSets
    )

    //////////////////////////////////////////////////////////////////////////////
    Persistence.removeItem("SRdata")
    Persistence.setItem("SRdata", [
      originalStructure,
      inputSyntax,
      defaultStyle,
      generatorValues || [],
      newReorders || [],
      lastMinuteReorders || [],
      randomIndices || [],
    ])
  }
}
