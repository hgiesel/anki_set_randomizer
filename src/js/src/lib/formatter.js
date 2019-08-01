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

  const renderSets = function(reordering) {

    const stylizedResults = []
    for (const set of reordering) {

      const actualValues = []
      // const randomStartIndex = Math.floor(Math.random() * options.colors.length)
      const randomStartIndex = 0

      for (const [i, element] of set.entries()) {
        if (element[3] !== 'd') {
          const theIndex = (randomStartIndex + i) % options.colors.length
          const style = `style="color: ${options.colors[theIndex]}; padding: 0px ${options.fieldPadding};"`
          actualValues.push(`<span ${style}> ${element[2]}</span>`)
        }
      }

      stylizedResults.push(actualValues.join(options.outputSyntax.fieldSeparator))
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
