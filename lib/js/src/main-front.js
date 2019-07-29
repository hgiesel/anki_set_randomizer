import update from './lib/update'

import formatter from './lib/formatter'
import { sortByIndices } from './lib/sort'
import { escapeString, shuffle } from './lib/util'

const query = '%QUERY%'
const colors = '%COLORS%'
const fieldPadding = '%FIELDPADDING%'

const inputSyntax = {
    openDelim: '%INPUTOPENDELIM%',
    closeDelim: '%INPUTCLOSEDELIM%',
    fieldSeparator: '%INPUTFIELDSEPARATOR%',
}
const outputSyntax = {
    openDelim: '%OUTPUTOPENDELIM%',
    closeDelim: '%OUTPUTCLOSEDELIM%',
    fieldSeparator: '%OUTPUTFIELDSEPARATOR%',
}

const form = formatter({
  query: ! query.startsWith('%') ? query : 'div#main',
  colors: ! colors[0].startsWith('%') ? colors : ['orange', 'olive', 'maroon', 'aqua', 'fuchsia', 'navy', 'lime'],
  fieldPadding: ! fieldPadding.startsWith('%') ? fieldPadding : '4px',

  inputSyntax: {
    openDelim: ! inputSyntax.openDelim.startsWith('%') ? inputSyntax.openDelim : '(^',
    closeDelim: ! inputSyntax.closeDelim.startsWith('%') ? inputSyntax.closeDelim : '^)',
    fieldSeparator: ! inputSyntax.fieldSeparator.startsWith('%') ? inputSyntax.fieldSeparator : '::',
  },
  outputSyntax: {
    openDelim: ! outputSyntax.openDelim.startsWith('%') ? outputSyntax.openDelim : '〔',
    closeDelim: ! outputSyntax.closeDelim.startsWith('%') ? outputSyntax.closeDelim : '〕',
    fieldSeparator: ! outputSyntax.fieldSeparator.startsWith('%') ? outputSyntax.fieldSeparator : '',
  }
})

try {
  const originalStructure = form.getOriginalStructure()
  console.log(originalStructure)
}
catch (e) {
  alert(`anki-set-randomizer: ${e}.`)
}

// commands
// sharedElements
// sharedOrders

// firstRoundRandomization

// secondRoundRandomization

update();

// const multipleChoiceSettings = {
//     query: query,
//     colors: colors,
//     fieldPadding: fieldPadding,
//     inputSyntax: inputSyntax,
//     outputSyntax: outputSyntax,
// }
