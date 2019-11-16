/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
} from './util.js'

export const formatter = function(inputSyntax, injections, iterIndex) {
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
  const _associations = {}

  const getAssociations = function(theSelector = inputSyntax.cssSelector) {
    return _associations[theSelector]
  }

  const getFoundStructure = function(theSelector = inputSyntax.cssSelector) {
    if (_foundStructure[theSelector]) {
      return _foundStructure[theSelector]
    }

    const theFoundStructure = []
    const theAssociations = []

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
        theAssociations.push([idx, theText.length, re.index, re[0].length])
        theFoundStructure.push(re[1])

        re = exprRegex.exec(theText)
      }
    }

    _associations[theSelector] = theAssociations
    _foundStructure[theSelector] = theFoundStructure

    return theFoundStructure
  }

  const deleteFromFoundStructure = function(theSelector = inputSyntax.cssSelector, markedForDeletion) {
    for (const idx of markedForDeletion) {
      delete _foundStructure[theSelector][idx]
      delete _associations[theSelector][idx]
    }

    // filtered out elements made empty
    _foundStructure[theSelector] = _foundStructure[theSelector].filter(() => true)
    _associations[theSelector] = _associations[theSelector].filter(() => true)
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
      .map((set, i) => set.map((elem, j) => [iterIndex, i, j, elem, 'n']))

    deleteFromFoundStructure(theSelector, markedForDeletion)
    return _elementsOriginal[theSelector] = elementsOriginal
  }

  const outputSets = function(stylizedResults, theSelector = inputSyntax.cssSelector) {
    const theHtml = getHtml(theSelector)
    const theAssociations = getAssociations(theSelector)

    for (const [idx, value] of stylizedResults.entries()) {
      if (stylizedResults[idx] /* when display:meta */) {
        const currentHtml = theHtml[theAssociations[idx][0]].innerHTML
        const associations = theAssociations[idx]

        theHtml[associations[0]].innerHTML = (
          currentHtml.substring(0, associations[2] - (associations[1] - currentHtml.length))
          + value
          + currentHtml.substring(associations[2] + associations[3] - (associations[1] - currentHtml.length), currentHtml.length)
        )
      }
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
