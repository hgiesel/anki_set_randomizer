import {
  saveData,
} from './save.js'

import {
  main,
} from './main.js'


document.addEventListener("DOMContentLoaded", function() {
  if (window.Persistence && Persistence.isAvailable()) {
    mainFront()
  }
})

function getNullData() {

  return [
    [/* originalStructure */],
    [/* generatorValues */],
    [/* reorders */],
    [/* reordersSecond */],
    {/* randomIndices */}
  ]
}

function mainFront() {

  const inputSyntax = {
    query: $$is_query,
    openDelim: $$is_open_delim,
    closeDelim: $$is_close_delim,
    fieldSeparator: $$is_field_separator,
    isRegex: $$is_is_regex,
  }

  const defaultStyle = {
    openDelim: $$ds_open_delim,
    closeDelim: $$ds_close_delim,
    emptySet: $$ds_empty_set,

    fieldPadding: $$ds_field_padding,
    fieldSeparator: $$ds_field_separator,

    colors: $$ds_colors,
    collectiveIndexing: $$ds_collective_indexing,
    randomStartIndex: $$ds_random_start_index,
  }

  const theSaveData = inputSyntax.query
    .map((v, i) => ({
      query: v,
      openDelim: inputSyntax.openDelim[i],
      closeDelim: inputSyntax.closeDelim[i],
      fieldSeparator: inputSyntax.fieldSeparator[i],
      isRegex: inputSyntax.isRegex[i],
    }))
    .reduce((accu, v) => {

      const saveData = main(
        true,
        v,
        defaultStyle,
        ...accu[1],
      )

      return [
        (accu[0].push([v, defaultStyle, ...saveData]), accu[0]),
        saveData,
      ]
    }, [
      [/* SRData to be */],
      getNullData(),
    ])[0]

  saveData(theSaveData)
}
