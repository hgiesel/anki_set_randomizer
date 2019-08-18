/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
  escapeHtml,
} from './util'

export default function formatter(options) {

  let _rawStructure = {}
  const exprString = `${escapeString(options.inputSyntax.openDelim)}(?:::)?(.*?)(?:::)?${escapeString(options.inputSyntax.closeDelim)}`

  const getRawStructure = function(theQuery=options.query) {
    if (_rawStructure[theQuery]) {
      return _rawStructure[theQuery]
    }

    else {
      const theElement = document.querySelector(theQuery)
      const theBody = theElement ? theElement.innerHTML : ''

      const rawStructure = []
      const exprRegex    = RegExp(exprString, 'gm')

      let m = exprRegex.exec(theBody)
      while (m) {
        rawStructure.push(m[1])
        m = exprRegex.exec(theBody)
      }

      return _rawStructure[theQuery] = rawStructure
    }
  }

  const getOriginalStructure = function(theQuery=options.query) {
    const splitResults = []

    for (const [i, group] of getRawStructure(theQuery).entries()) {
      const splitGroup = group
        .split(options.inputSyntax.fieldSeparator)
        .map((v, j) => [i, j, v])

      splitResults.push(splitGroup)
    }

    return splitResults
  }

  const renderSets = function(reordering, renderDirectives, randomIndices, theQuery=options.query) {

    let absoluteIndex = 0 + (
      options.colors_random_start_index
      ? Math.floor((randomIndices[0] || Math.random()) * options.colors.length)
      : 0
    )
    let absoluteIndexSave = 0

    const stylizedResults = Array(reordering.length)
    for (const [i, set] of reordering.entries()) {

      const customRendering     = renderDirectives.find(rd => rd.name === i).directives

      let theColors
      if (customRendering.colors === undefined) {
        theColors = options.colors
      }
      else {
        theColors = customRendering.colors

        absoluteIndexSave = absoluteIndex
        absoluteIndex     = 0
      }

      const theFieldSeparator = customRendering.fieldSeparator === undefined
        ? options.outputSyntax.fieldSeparator
        : customRendering.fieldSeparator
      const theFieldPadding  = customRendering.fieldPadding === undefined
      ? options.fieldPadding
        : customRendering.fieldPadding
      const theCloseDelim = customRendering.closeDelim === undefined
        ? options.outputSyntax.closeDelim
        : customRendering.closeDelim
      const theOpenDelim = customRendering.openDelim === undefined
        ? options.outputSyntax.openDelim
        : customRendering.openDelim

      const actualValues = []

      const randomStartIndex = (
        options.colors_random_start_index
        ? Math.floor((randomIndices[i] || Math.random()) * theColors.length)
        : 0
      )

      if (customRendering.display === 'sort') {
        set.rendering.sort()
      }

      for (const [j, element] of set.rendering.entries()) {
        if (element[3] !== 'd') {
          const theIndex    = ((options.colors_collective_indexing ? absoluteIndex++ : randomStartIndex + j) % theColors.length)

          const className   = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`

          const colorChoice = theColors[theIndex] ? ` color: ${theColors[theIndex]};` : ''
          const style       = `style="padding: 0px ${theFieldPadding}px;${colorChoice}"`

          actualValues.push(`<span ${className} ${style}>${element[2]}</span>`)
        }
      }

      if (customRendering.display === 'none') {
        stylizedResults[set.order] = ''
      }
      else if (actualValues.length > 0) {
        stylizedResults[set.order] = `${theOpenDelim}${actualValues.join(theFieldSeparator)}${theCloseDelim}`
      }
      else {
        stylizedResults[set.order] = `${theOpenDelim}${options.outputSyntax.emptySet}${theCloseDelim}`
      }

      if (customRendering.colors !== undefined) {
        absoluteIndex = absoluteIndexSave
      }
    }

    const theElement = document.querySelector(theQuery)
    let replacement = theElement ? theElement.innerHTML : ''

    for (const [i, v] of getRawStructure(theQuery).entries()) {

      const renderOutput = stylizedResults[i]

      replacement = replacement
        .replace(
          `${options.inputSyntax.openDelim}${v}${options.inputSyntax.closeDelim}`,
          `${renderOutput}`
        )
    }

    document.querySelector(theQuery).innerHTML = replacement

    if (theQuery === 'div#clozed') {

      const olParse = getOriginalStructure('div#original').flat()

      if (olParse.length > 0) {
        const newReordering = reordering
          .map(v => ({ rendering: v.rendering
            .map(w => [
              w[0],
              w[1],
              olParse.find(u => u[0] === w[0] && u[1] === w[1])[2],
              w[3]],
            ), order: v.order
          }))

        renderSets(newReordering, renderDirectives, randomIndices, 'div#original')
      }
    }
  }

  return {
    getOriginalStructure: getOriginalStructure,
    renderSets: renderSets,
  }
}
