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

  const renderSets = function(reordering, randomIndices, theQuery=options.query) {

    console.log(reordering)

    let absoluteIndex = 0 + (
      options.colors_random_start_index
      ? Math.floor((randomIndices[0] || Math.random()) * options.colors.length)
      : 0
    )

    const stylizedResults = Array(reordering.length)
    for (const [i, set] of reordering.entries()) {

      const actualValues = []

      const randomStartIndex = (
        options.colors_random_start_index
        ? Math.floor((randomIndices[i] || Math.random()) * options.colors.length)
        : 0
      )

      for (const [j, element] of set.rendering.entries()) {
        if (element[3] !== 'd') {
          const theIndex    = ((options.colors_collective_indexing ? absoluteIndex++ : randomStartIndex + j) % options.colors.length)

          const className   = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`

          const colorChoice = options.colors[theIndex] ? ` color: ${options.colors[theIndex]};` : ''
          const style       = `style="padding: 0px ${options.fieldPadding}px;${colorChoice}"`

          actualValues.push(`<span ${className} ${style}>${element[2]}</span>`)
        }
      }

      stylizedResults[set.order] = (actualValues.join(options.outputSyntax.fieldSeparator))
    }

    const theElement = document.querySelector(theQuery)
    let replacement = theElement ? theElement.innerHTML : ''

    for (const [i, v] of getRawStructure(theQuery).entries()) {

      const renderOutput = stylizedResults[i] || options.outputSyntax.emptySet

      replacement = replacement
        .replace(
          `${options.inputSyntax.openDelim}${v}${options.inputSyntax.closeDelim}`,
          `${options.outputSyntax.openDelim}${renderOutput}${options.outputSyntax.closeDelim}`
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

        renderSets(newReordering, randomIndices, 'div#original')
      }
    }
  }

  return {
    getOriginalStructure: getOriginalStructure,
    renderSets: renderSets,
  }
}
