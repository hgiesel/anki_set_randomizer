/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
  escapeHtml,
  treatNewlines,
} from './util'

export default function formatter(inputSyntax) {

  let _rawStructure = {}
  const exprString =
    `${escapeString(inputSyntax.openDelim)}` +
    `((?:.|\\n|\\r)*?)` +
    `${escapeString(inputSyntax.closeDelim)}`

  const getRawStructure = function(theQuery=inputSyntax.query) {
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

  const getOriginalStructure = function(theQuery=inputSyntax.query) {
    const splitResults = []

    for (const [i, group] of getRawStructure(theQuery).entries()) {
      const splitGroup = group
        .split(inputSyntax.fieldSeparator)
        .map((v, j) => [i, j, v])

      splitResults.push(splitGroup)
    }

    return splitResults
  }

  const stylingsAccessor = function(stylingDefinitions, randomIndices) {

    const defaultStyle = stylingDefinitions.find(v => v.name === 'default').stylings

    stylingDefinitions
      .forEach(def => {
        def.stylings.randomIndices = randomIndices[def.name] || []
        def.stylings.nextIndex = 0
      })

    const propAccessor = function(styleName, theDefaultStyle=defaultStyle) {

      const theStyle = styleName
        ? stylingDefinitions.find(v => v.name === styleName).stylings
        : theDefaultStyle

      const getProp = function(propName) {

        return theStyle[propName] !== undefined
          ? theStyle[propName]
          : theDefaultStyle[propName]
      }

      let currentIndex

      const getIndex = function() {

        let theIndex
        if (currentIndex === undefined) {
          if (getProp('collectiveIndexing') && getProp('randomStartIndex')) {

            if (getProp('randomIndices').length === 0) {
              theIndex = Math.floor(Math.random() * getProp('colors').length)
              getProp('randomIndices').push(theIndex)
            }
            else {
              theIndex = getProp('nextIndex') === 0
                ? getProp('randomIndices')[0]
                : getProp('nextIndex') % getProp('colors').length
            }

          }
          else if (getProp('collectiveIndexing')) {
            theIndex = (getProp('nextIndex')) % getProp('colors').length
          }
          else if (getProp('randomStartIndex')) {
            theIndex = Math.floor(Math.random() * getProp('colors').length)
            getProp('randomIndices').push(theIndex)
          }
          else {
            theIndex = 0
          }
        }

        else {
          theIndex = ++currentIndex % getProp('colors').length
        }

        currentIndex = theIndex
        theStyle.nextIndex = currentIndex + 1

        return theIndex
      }

      return {
        getProp: getProp,
        getIndex: getIndex,
      }

    }

    const exportIndices = function() {
      const result = {}
      stylingDefinitions
        .forEach(def => {
          result[def.name] = def.stylings.randomIndices
        })
      return result
    }

    return {
      defaultStyle: defaultStyle,
      propAccessor: propAccessor,
      exportIndices: exportIndices,
    }
  }

  const renderSets = function(reordering, stylingDefinitions, stylingAssignments, randomIndices, numberedSets, theQuery=inputSyntax.query) {

    const sa = stylingsAccessor(stylingDefinitions, randomIndices)
    const stylizedResults = Array(reordering.length)

    for (const [i, set] of reordering.entries()) {

      const actualValues = []
      const styleName = stylingAssignments[i]
      const pa = sa.propAccessor(styleName)

      if (pa.getProp('display') === 'sort') {
        set.rendering.sort()
      }
      else if (pa.getProp('display') === 'orig') {
        set.rendering = numberedSets.find(v => v.name === i).elements
      }

      for (const [j, element] of set.rendering.entries()) {
        if (element[3] !== 'd') {
          const theIndex = pa.getIndex()

          const colorChoice = pa.getProp('colors')
            ? ` color: ${pa.getProp('colors')[theIndex]};`
            : ''

          const className = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`
          const blockDisplay = pa.getProp('display') === 'block'
            ? ' display: block;'
            : ''

          const style = `style="padding: 0px ${pa.getProp('fieldPadding')}px;${colorChoice}${blockDisplay}"`
          const theValue = pa.getProp('display') === 'block'
            ? `<record ${className} ${style}><div>${treatNewlines(element[2])}</div></record>`
            : `<record ${className} ${style}>${element[2]}</record>`

          actualValues.push(theValue)
        }
      }

      if (pa.getProp('display') === 'none') {
        stylizedResults[set.order] = ''
      }
      else if (actualValues.length === 0 || pa.getProp('display') === 'empty') {
        stylizedResults[set.order] =
          `${pa.getProp('openDelim')}` +
          `${pa.getProp('emptySet')}` +
          `${pa.getProp('closeDelim')}`
      }
      else {
        stylizedResults[set.order] =
          `${pa.getProp('openDelim')}` +
          `${actualValues.join(pa.getProp('fieldSeparator'))}` +
          `${pa.getProp('closeDelim')}`
      }
    }

    const theElement = document.querySelector(theQuery)
    let replacement = theElement ? theElement.innerHTML : ''

    for (const [i, v] of getRawStructure(theQuery).entries()) {

      const renderOutput = stylizedResults[i]

      replacement = replacement
        .replace(
          `${inputSyntax.openDelim}${v}${inputSyntax.closeDelim}`,
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

    return sa.exportIndices()
  }

  return {
    getOriginalStructure: getOriginalStructure,
    renderSets: renderSets,
  }
}
