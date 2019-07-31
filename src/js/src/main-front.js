import formatter from './lib/formatter'
import { sortByIndices } from './lib/sort'
import { escapeString, shuffle } from './lib/util'

if (window.Persistence && Persistence.isAvailable()) {
  Persistence.removeItem("AnkiSetRandomizerOptions")
  // and everything else
}

const query = $$query
const colors = $$colors
const fieldPadding = $$field_padding

const inputSyntax = {
    openDelim: $$input_syntax_open_delim,
    closeDelim: $$input_syntax_close_delim,
    fieldSeparator: $$input_syntax_field_separator,
}
const outputSyntax = {
    openDelim: $$output_syntax_open_delim,
    closeDelim: $$output_syntax_close_delim,
    fieldSeparator: $$output_syntax_field_separator,
}

const form = formatter({
  query: query,
  colors: colors,
  fieldPadding: fieldPadding,

  inputSyntax: {
    openDelim: inputSyntax.openDelim,
    closeDelim: inputSyntax.closeDelim,
    fieldSeparator: inputSyntax.fieldSeparator,
  },
  outputSyntax: {
    openDelim: outputSyntax.openDelim,
    closeDelim: outputSyntax.closeDelim,
    fieldSeparator: outputSyntax.fieldSeparator,
  }
})

try {
  const originalStructure = form.getOriginalStructure()
  alert(originalStructure)
}
catch (e) {
  alert(`anki-set-randomizer: ${e}.`)
  const originalStructure = []
}

// processCommands(originalStructure)
// sharedElements(originalStructure)
// sharedOrders(originalStructure)

// firstRoundRandomization

// secondRoundRandomization

// const multipleChoiceSettings = {
//     query: query,
//     colors: colors,
//     fieldPadding: fieldPadding,
//     inputSyntax: inputSyntax,
//     outputSyntax: outputSyntax,
// }
