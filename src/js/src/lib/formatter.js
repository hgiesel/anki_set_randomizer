/**
 * For all funtions that concerns accessing the html content
 */
import { escapeString } from './util'

export default function formatter(options) {

  let _rawStructure

  const getRawStructure = function() {
    if (_rawStructure) {
      return _rawStructure
    }

    else {
      const theElement = document.querySelector(options.query)
      const theBody = theElement ? theElement.innerHTML : ''

      const rawStructure = []

      const exprRegex = RegExp(
        `${escapeString(options.inputSyntax.openDelim)}(?:::)?(.*?)(?:::)?${escapeString(options.inputSyntax.closeDelim)}`,
        'gm'
      )

      let m = exprRegex.exec(theBody)
      while (m) {
        rawStructure.push(m[1])
        m = exprRegex.exec(theBody)
      }

      return _rawStructure = rawStructure
    }
  }

  const getOriginalStructure = function() {
    const splitResults = []

    for (const [i, group] of getRawStructure().entries()) {
      const splitGroup = group
        .split(options.inputSyntax.fieldSeparator)
        .map((v, j) => [i, j, v])

      splitResults.push(splitGroup)
    }

    return splitResults
  }

  const renderSets = function(reordering, randomIndices) {

    let absoluteIndex = 0 + (options.colors_random_start_index ? Math.floor(randomIndices[0] * options.colors.length) : 0)

    const stylizedResults = Array(reordering.length)
    for (const [i, set] of reordering.entries()) {

      const actualValues = []

      const randomStartIndex = (options.colors_random_start_index ? Math.floor(randomIndices[i] * options.colors.length) : 0)

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

    const theElement = document.querySelector(options.query)
    let replacement = theElement ? theElement.innerHTML : ''

    for (const [i, v] of getRawStructure().entries()) {
      replacement = replacement
        .replace(
          `${options.inputSyntax.openDelim}${v}${options.inputSyntax.closeDelim}`,
          `${options.outputSyntax.openDelim}${stylizedResults[i]}${options.outputSyntax.closeDelim}`
        )
    }

    document.querySelector(options.query).innerHTML = replacement
  }

  return {
    getRawStructure: getRawStructure,
    getOriginalStructure: getOriginalStructure,
    renderSets: renderSets,
  }
}
