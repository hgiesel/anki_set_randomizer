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
  const getHtml = function(theSelector=inputSyntax.cssSelector) {
    if (_htmlContent[theSelector]) {
      return _htmlContent[theSelector]
    }
    else {
      const theHtml = document.querySelectorAll(theSelector)

      return _htmlContent[theSelector] = theHtml
    }
  }

  let isValid     = true
  let isContained = false

  const elemDelim = '$$$$$D$E$L$I$M$$$$$'

  // a single big string with inserted elemDelims
  const _rawStructure = {}
  const getRawStructure = function(theSelector=inputSyntax.cssSelector) {
    if (_rawStructure[theSelector]) {
      return _rawStructure[theSelector]
    }

    else {
      const theHtml = getHtml(theSelector)

      if (!theHtml || theHtml.length === 0) {
        isValid = false
        return _rawStructure[theSelector] = ''
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

      return _rawStructure[theSelector] = theRawStructure
    }
  }

  const exprString =
    (inputSyntax.isRegex
      ? inputSyntax.openDelim
      : escapeString(inputSyntax.openDelim)) +
    `((?:.|\\n|\\r)*?)` +
    (inputSyntax.isRegex
      ? inputSyntax.closeDelim
      : escapeString(inputSyntax.closeDelim))

  // the found sets in the text
  const _foundStructure = {}
  const getFoundStructure = function(theSelector=inputSyntax.cssSelector) {
    if (_foundStructure[theSelector]) {
      return _foundStructure[theSelector]
    }

    else {
      const theFoundStructure = []

      const theRawStructure = getRawStructure(theSelector)

      let exprRegex

      try {
        exprRegex = RegExp(exprString, 'gm')
      }
      catch {
        isValid = false
        return _foundStructure[theSelector] = []
      }

      let m = exprRegex.exec(theRawStructure)

      while (m) {
        theFoundStructure.push(m[1])
        m = exprRegex.exec(theRawStructure)
      }

      return _foundStructure[theSelector] = theFoundStructure
    }
  }

  // 2d list of elements in the form of [[i, j, element]]
  const _originalStructure = {}
  const getOriginalStructure = function(theSelector=inputSyntax.cssSelector) {
    if (_originalStructure[theSelector]) {
      return _originalStructure[theSelector]
    }

    else {
      const theOriginalStructure = []
      const theFoundStructure = getFoundStructure(theSelector)

      for (const [i, group] of theFoundStructure.entries()) {
        const splitGroup = group
          .split(inputSyntax.isRegex
            ? new RegExp(inputSyntax.fieldSeparator)
            : inputSyntax.fieldSeparator)
          .map((elem, j) => [i, j, elem, /* TODO 'n' */])

        theOriginalStructure.push(splitGroup)
      }

      return _originalStructure[theSelector] = theOriginalStructure
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

      const getProp = function(propName, propName2) {

        return propName2 === undefined
          ? theStyle[propName] !== undefined
            ? theStyle[propName]
            : theDefaultStyle[propName]
          : theStyle[propName] === undefined || theStyle[propName][propName2] === undefined
            ? theDefaultStyle[propName][propName2]
            : theStyle[propName][propName2]
      }

      let currentIndex

      const getColorIndex = function() {

        let theIndex
        if (currentIndex === undefined) {
          if (getProp('colors', 'collectiveIndexing') && getProp('colors', 'randomStartIndex')) {

            if (getProp('colors', 'randomIndices').length === 0) {
              theIndex = Math.floor(Math.random() * getProp('colors', 'values').length)
              getProp('randomIndices').push(theIndex)
            }
            else {
              theIndex = getProp('nextIndex') === 0
                ? getProp('randomIndices')[0]
                : getProp('nextIndex') % getProp('colors', 'values').length
            }

          }
          else if (getProp('colors', 'collectiveIndexing')) {
            theIndex = (getProp('nextIndex')) % getProp('colors', 'values').length
          }
          else if (getProp('colors', 'randomStartIndex')) {
            theIndex = Math.floor(Math.random() * getProp('colors', 'values').length)
            getProp('randomIndices').push(theIndex)
          }
          else {
            theIndex = 0
          }
        }

        else {
          theIndex = ++currentIndex % getProp('colors', 'values').length
        }

        currentIndex = theIndex
        theStyle.nextIndex = currentIndex + 1

        return theIndex
      }

      return {
        getProp: getProp,
        getColorIndex: getColorIndex,
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

  const renderSets = function(reordering, stylingDefinitions, stylingAssignments, randomIndices, numberedSets, theSelector=inputSyntax.cssSelector) {

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
          const theIndex = pa.getColorIndex()

          const colorChoice = pa.getProp('colors', 'values')
            ? ` color: ${pa.getProp('colors', 'values')[theIndex]};`
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

    let theRawStructure = getRawStructure(theSelector)

    for (const [i, value] of getFoundStructure(theSelector).entries()) {
      theRawStructure = theRawStructure
        .replace(
          (inputSyntax.isRegex
            ? new RegExp(`${inputSyntax.openDelim}${escapeString(value)}${inputSyntax.closeDelim}`)
            : `${inputSyntax.openDelim}${value}${inputSyntax.closeDelim}`),
          `${stylizedResults[i]}`
        )
    }

    const theHtml = getHtml(theSelector)

    theRawStructure
      .split(elemDelim)
      .forEach((v, i) => theHtml[i].innerHTML = v)

    if (theSelector === 'div#clozed') {
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
