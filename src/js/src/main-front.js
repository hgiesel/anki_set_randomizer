import formatter from './lib/formatter'

import {
  processNumberedSets,
  processElementSharingSets,
  processOrderSharingSets,
  processCommands,
} from './lib/processor'

import {
  applySetReorder,
  applyCommand,
} from './lib/sort'

import {
  escapeString,
} from './lib/util'

import {
  reorderNumberedSets,
  reorderElementSharingSets,
  applySharedOrder
} from './lib/reorder'

if (window.Persistence && Persistence.isAvailable()) {
  Persistence.removeItem("AnkiSetRandomizerOptions")
  Persistence.removeItem("AnkiSetRandomizerFirstRandomization")
  Persistence.removeItem("AnkiSetRandomizerSecondRandomization")
  // and everything else
}

const options = {
  query: $$query,
  colors: $$colors,
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
  }
}

const form = formatter(options)
const originalStructure = form.getOriginalStructure()

if (originalStructure) {
  const numberedSets = processNumberedSets(originalStructure)
  const elementSharingSets = processElementSharingSets(originalStructure)
  const orderSharingSets = processElementSharingSets(originalStructure)

  const elementsOrig = numberedSets
    .map(v => v.elements)
    .map(v => v.map(u => [...u, 'n'])
  )

  const elements = JSON.parse(JSON.stringify(elementsOrig))

  const setReorders = [
    reorderNumberedSets(numberedSets),
    reorderElementSharingSets(elementSharingSets, numberedSets),
  ].flat()

  // modifies setReorders (!)
  orderSharingSets.forEach(oss => applySharedOrder(oss, setReorders))

  // modifies elements (!)
  // are applied numbered 0 -> n, then named in order of appearance
  setReorders.forEach(sr => applySetReorder(sr, elements, elementsOrig))

  //////////////////////////////////////////////////////////////////////////////
  // are applied last to first
  const commands = processCommands(originalStructure)

  const reversedCommands = commands.reverse()
  const sortedReversedCommands = [
    reversedCommands.filter(v => v[2] === 'm'),
    reversedCommands.filter(v => v[2] === 'c'),
    reversedCommands.filter(v => v[2] === 'd')
    ].flat()

  sortedReversedCommands
    .forEach(cmd => applyCommand(cmd, elements))

  //////////////////////////////////////////////////////////////////////////////
  const lastMinuteStructure = elements
    .map(set => set.filter(elem => elem[3] !== 'd'))

  const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure)
  lastMinuteNumberedSets.forEach((v, i) => v.lastMinute = numberedSets[i].lastMinute)

  const lastMinuteElementsOrig = lastMinuteNumberedSets
    .map(v => v.elements)
    .map(v => v.map(u => [u[0], u[1], u[2], 'n']))

  const lastMinuteElements = JSON.parse(JSON.stringify(lastMinuteElementsOrig))

  const lastMinuteSetReorders = [
    reorderNumberedSets(lastMinuteNumberedSets),
    reorderElementSharingSets(elementSharingSets, lastMinuteNumberedSets),
  ].flat()

  console.log(lastMinuteSetReorders)
  // modifies setReorders (!)
  orderSharingSets.filter(v => v.lastMinute).forEach(oss => applySharedOrder(oss, lastMinuteSetReorders))

  // modifies elements (!)
  // are applied numbered 0 -> n, then named in order of appearance
  lastMinuteSetReorders.filter(v => v.lastMinute).forEach(sr => applySetReorder(sr, lastMinuteElements, lastMinuteElementsOrig))

  //////////////////////////////////////////////////////////////////////////////
  form.renderSets(lastMinuteElements)
}

if (options) {
  if (window.Persistence && Persistence.isAvailable()) {
    Persistence.setItem("AnkiSetRandomizerOptions", options)
  }
}
