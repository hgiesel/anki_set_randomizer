/**
 * For all funtions that concerns accessing the html content
 */

import {
  escapeString,
} from './util.js'

import {
  toSRToken,
} from '../util.js'

export const formatter = function(inputSyntax, injections, iterIndex) {
  let _isInvalid = false
  let _isContained = false

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

  const elemDelim = toSRToken(['ELEMDELIM'])

  // a single big string with inserted elemDelims
  const _rawStructure = {}
  const getRawStructure = function(theSelector = inputSyntax.cssSelector) {
    if (_rawStructure[theSelector]) {
      return _rawStructure[theSelector]
    }

    const theHtml = getHtml(theSelector)

    if (!theHtml || theHtml.length === 0) {
      _isInvalid = true
      return _rawStructure[theSelector] = ''
    }

    const theRawStructure = theHtml
      .map(v => v.innerHTML)
      .join(elemDelim)

    if (theRawStructure.includes('SET RANDOMIZER FRONT TEMPLATE')
      || theRawStructure.includes('SET RANDOMIZER BACK TEMPLATE')
    ) {
      _isContained = true
    }

    return _rawStructure[theSelector] = theRawStructure
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
    const theRawStructure = getRawStructure(theSelector)

    let exprRegex = null
    try {
      exprRegex = RegExp(exprString, 'gmu')
    }
    catch (e) {
      _isInvalid = true
      return _foundStructure[theSelector] = []
    }

    let m = exprRegex.exec(theRawStructure)

    while (m) {
      theFoundStructure.push(m[1])
      m = exprRegex.exec(theRawStructure)
    }

    return _foundStructure[theSelector] = theFoundStructure
  }

  const deleteFromFoundStructure = function(theSelector = inputSyntax.cssSelector, markedForDeletion) {
    _foundStructure[theSelector] = _foundStructure[theSelector]
      .filter((set, idx) => !markedForDeletion.includes(idx))
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
    let theRawStructure = getRawStructure(theSelector)

    for (const [i, value] of getFoundStructure(theSelector).entries()) {
      if (stylizedResults[i] !== null /* when display:meta */) {
        theRawStructure = theRawStructure
          .replace((inputSyntax.isRegex
            ? new RegExp(`${inputSyntax.openDelim}${escapeString(value)}${inputSyntax.closeDelim}`, 'u')
            : `${inputSyntax.openDelim}${value}${inputSyntax.closeDelim}`), `${stylizedResults[i]}`)
      }
    }

    const theHtml = getHtml(theSelector)
    theRawStructure
      .split(elemDelim)
      .forEach((v, i) => theHtml[i].innerHTML = v)
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
