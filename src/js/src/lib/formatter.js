/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
  escapeHtml,
  treatNewlines,
} from './util'

export default function formatter(inputSyntax) {

  // the original NodeList
  const _htmlContent  = {}
  const getHtml = function(theQuery=inputSyntax.query) {
    if (_htmlContent[theQuery]) {
      return _htmlContent[theQuery]
    }
    else {
      const theHtml = document.querySelectorAll(theQuery)

      return _htmlContent[theQuery] = theHtml
    }
  }

  let isValid     = true
  let isContained = false

  const exprString =
    `${escapeString(inputSyntax.openDelim)}` +
    `((?:.|\\n|\\r)*?)` +
    `${escapeString(inputSyntax.closeDelim)}`

  const elemDelim = '$$$$$D$E$L$I$M$$$$$'

  // a single big string with inserted elemDelims
  const _rawStructure = {}
  const getRawStructure = function(theQuery=inputSyntax.query) {
    if (_rawStructure[theQuery]) {
      return _rawStructure[theQuery]
    }

    else {
      const theHtml = getHtml(theQuery)

      if (!theHtml || theHtml.length === 0) {
        isValid = false
        return []
      }

      const theRawStructure = [...theHtml]
        .map(v => v.innerHTML)
        .join(elemDelim)

      if (
        theRawStructure.includes('SET RANDOMIZER FRONT TEMPLATE') ||
        theRawStructure.includes('SET RANDOMIZER BACK TEMPLATE')
      ) {
        isContained = true
      }

      return _rawStructure[theQuery] = theRawStructure
    }
  }

  // the found sets in the text
  const _foundStructure = {}
  const getFoundStructure = function(theQuery=inputSyntax.query) {
    if (_foundStructure[theQuery]) {
      return _foundStructure[theQuery]
    }

    else {
      const theFoundStructure = []

      const theRawStructure = getRawStructure(theQuery)
      const exprRegex = RegExp(exprString, 'gm')

      let m = exprRegex.exec(theRawStructure)

      while (m) {
        theFoundStructure.push(m[1])
        m = exprRegex.exec(theRawStructure)
      }

      return _foundStructure[theQuery] = theFoundStructure
    }
  }

  // 2d list of elements in the form of [[i, j, element]]
  const _originalStructure = {}
  const getOriginalStructure = function(theQuery=inputSyntax.query) {
    if (_originalStructure[theQuery]) {
      return _originalStructure[theQuery]
    }

    else {
      const theOriginalStructure = []
      const theFoundStructure = getFoundStructure(theQuery)

      for (const [i, group] of theFoundStructure.entries()) {
        const splitGroup = group
          .split(inputSyntax.fieldSeparator)
          .map((elem, j) => [i, j, elem, /* TODO 'n' */])

        theOriginalStructure.push(splitGroup)
      }

      return _originalStructure[theQuery] = theOriginalStructure
    }
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

    let theRawStructure = getRawStructure(theQuery)

    for (const [i, value] of getFoundStructure(theQuery).entries()) {
      theRawStructure = theRawStructure
        .replace(
          `${inputSyntax.openDelim}${value}${inputSyntax.closeDelim}`,
          `${stylizedResults[i]}`
        )
    }

    const theHtml = getHtml(theQuery)

    theRawStructure
      .split(elemDelim)
      .forEach((v, i) => theHtml[i].innerHTML = v)

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
    isValid: isValid,
  }
}
