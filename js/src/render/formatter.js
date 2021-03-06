/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
} from './util.js'

export const formatter = function(inputSyntax, injections, iterName) {
  let _isInvalid = false
  const _isContained = false

  const isInvalid = function() {
    return _isInvalid
  }

  const isContained = function() {
    return _isContained
  }

  // the original NodeList
  const _htmlContent = {}
  const getHtml = function(theSelector = inputSyntax.cssSelector) {
    if (_htmlContent[theSelector]) {
      return _htmlContent[theSelector]
    }
    else {
      try {
        return _htmlContent[theSelector] = Array.from(document.querySelectorAll(theSelector))
      }

      catch (e) {
        _isInvalid = true
        return _htmlContent[theSelector] = Array.from(document.createDocumentFragment().childNodes)
      }
    }
  }

  const exprContent = '((?:.|\\n|\\r)*?)'
  const exprString = inputSyntax.isRegex
      ? `${inputSyntax.openDelim}${exprContent}${inputSyntax.closeDelim}`
      : `${escapeString(inputSyntax.openDelim)}${exprContent}${escapeString(inputSyntax.closeDelim)}`

  // the found sets in the text
  const _foundStructure = {}
  const getFoundStructure = function(theSelector = inputSyntax.cssSelector) {
    if (_foundStructure[theSelector]) {
      return _foundStructure[theSelector]
    }

    const theFoundStructure = []

    let exprRegex = null
    try {
      exprRegex = RegExp(exprString, 'gmu')
    }
    catch (e) {
      _isInvalid = true
      return _foundStructure[theSelector] = []
    }

    for (const [idx, tag] of getHtml(theSelector).entries()) {
      const theText = tag.innerHTML
      let re = exprRegex.exec(theText)

      while (re) {
        theFoundStructure.push({
          tagId: idx,
          startIndex: re.index,
          originalLength: theText.length,
          contentWithDelimiterLength: re[0].length,
          content: re[1],
        })

        re = exprRegex.exec(theText)
      }
    }

    _foundStructure[theSelector] = theFoundStructure

    return theFoundStructure
  }

  const deleteFromFoundStructure = function(theSelector = inputSyntax.cssSelector, markedForDeletion) {
    for (const idx of markedForDeletion) {
      delete _foundStructure[theSelector][idx]
    }

    // filtered out elements made empty
    _foundStructure[theSelector] = _foundStructure[theSelector].filter(() => true)
  }

  // 2d list of elements in the form of [[i, j, element]]
  const _elementsOriginal = {}
  const getElementsOriginal = function(theSelector = inputSyntax.cssSelector) {
    if (_elementsOriginal[theSelector]) {
      return _elementsOriginal[theSelector]
    }

    const theFoundStructure = getFoundStructure(theSelector)

    const injectionKeyword = '$inject()'
    const metaKeyword = '$meta()'

    const trueInjections = injections
      .map(injectionSet => injectionSet.concat(metaKeyword))

    const markedForDeletion = []

    const elementsRaw = theFoundStructure
      .map(found => found.content)
      .map(group => group.split(inputSyntax.isRegex
        ? new RegExp(inputSyntax.fieldSeparator, 'u')
        : inputSyntax.fieldSeparator))
      .flatMap((set, idx) => (
        set.includes(injectionKeyword)
          ? (markedForDeletion.push(idx), [set].concat(trueInjections))
          : set.includes(metaKeyword)
          ? (markedForDeletion.push(idx), [set])
          : [set]
      ))

    const elementsOriginal = elementsRaw
      .map((set, i) => set.map((elem, j) => [iterName, i, j, elem, 'n']))

    deleteFromFoundStructure(theSelector, markedForDeletion)
    return _elementsOriginal[theSelector] = elementsOriginal
  }

  const outputSets = function(stylizedResults, theSelector = inputSyntax.cssSelector) {
    const theHtml = getHtml(theSelector)
    const theFoundStructure = getFoundStructure(theSelector)

    const currentHtmls = theHtml.map(html => html.innerHTML)

    for (const [idx, value] of stylizedResults.entries()) {
      if (typeof value === 'string' /* for display=meta */) {
        const associations = theFoundStructure[idx]
        const currentHtml = currentHtmls[associations.tagId]

        const offset = currentHtml.length - associations.originalLength
        const startPoint = associations.startIndex + offset
        const endPoint = associations.startIndex + associations.contentWithDelimiterLength + offset

        currentHtmls[associations.tagId] = (
          `${currentHtml.substring(0, startPoint)}${value}${currentHtml.substring(endPoint, currentHtml.length)}`
        )
      }
    }

    for (let step = 0; step < theHtml.length; step++) {
      theHtml[step].innerHTML = currentHtmls[step]
    }
  }

  return {
    getHtml: getHtml,
    getElementsOriginal: getElementsOriginal,
    outputSets: outputSets,
    isInvalid: isInvalid,
    isContained: isContained,
  }
}

export default formatter
