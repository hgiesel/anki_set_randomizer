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
    openDelim: unescape($$input_syntax_open_delim.replace(/\\\\/g, '\\')),
    closeDelim: unescape($$input_syntax_close_delim.replace(/\\\\/g, '\\')),
    fieldSeparator: unescape($$input_syntax_field_separator.replace(/\\\\/g, '\\')),
}
const outputSyntax = {
    openDelim: unescape($$output_syntax_open_delim.replace(/\\\\/g, '\\')),
    closeDelim: unescape($$output_syntax_close_delim.replace(/\\\\/g, '\\')),
    fieldSeparator: unescape($$output_syntax_field_separator.replace(/\\\\/g, '\\')),
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
  console.log(originalStructure)
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
