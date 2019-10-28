/**
 * For all funtions that concerns accessing the html content
 */

import {
  star,
} from '../util.js'

import {
  escapeString,
  escapeHtml,
  treatNewlines,
  getSrToken,
} from './util.js'

const htmlTagsRegex = new RegExp('<.*?>', 'g')
const htmlTagsNoBrRegex = new RegExp('<(?!br>).*?>', 'g')

export default function formatter(inputSyntax, injections, iterIndex) {

  let _isInvalid
  let _isContained

  const isInvalid = function() {
    return _isInvalid
  }

  const isContained = function() {
    return _isContained
  }

  // the original NodeList
  const _htmlContent  = {}
  const getHtml = function(theSelector=inputSyntax.cssSelector) {
    _isInvalid   = false
    _isContained = false

    if (_htmlContent[theSelector]) {
      return _htmlContent[theSelector]
    }
    else {

      try {
        return _htmlContent[theSelector] = document.querySelectorAll(theSelector)
      }
      catch {
        _isInvalid = true
        return _htmlContent[theSelector] = document.createDocumentFragment().childNodes
      }

    }
  }

  const elemDelim = getSrToken(['ELEMDELIM'])

  // a single big string with inserted elemDelims
  const _rawStructure = {}
  const getRawStructure = function(theSelector=inputSyntax.cssSelector) {

    if (_rawStructure[theSelector]) {
      return _rawStructure[theSelector]
    }

    else {
      const theHtml = getHtml(theSelector)

      if (!theHtml || theHtml.length === 0) {
        _isInvalid = true
        return _rawStructure[theSelector] = ''
      }

      const theRawStructure = [...theHtml]
        .map(v => v.innerHTML)
        .join(elemDelim)

      if (
        theRawStructure.includes('SET RANDOMIZER FRONT TEMPLATE') ||
        theRawStructure.includes('SET RANDOMIZER BACK TEMPLATE')
      ) {
        _isContained = true
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
  }

  // 2d list of elements in the form of [[i, j, element]]
  const _elementsOriginal = {}
  const getElementsOriginal = function(theSelector=inputSyntax.cssSelector) {
    if (_elementsOriginal[theSelector]) {
      return _elementsOriginal[theSelector]
    }

    else {
      const theFoundStructure = getFoundStructure(theSelector)

      const makeInjectionsMeta = "$apply(meta)"
      const injectionKeyword = "$inject"

      let injectFound = false

      const theElementsOriginal = theFoundStructure
        .map(group => group.split(inputSyntax.isRegex
          ? new RegExp(inputSyntax.fieldSeparator)
          : inputSyntax.fieldSeparator))
        .flatMap(v => v[0] === '$inject'
          ? (injectFound = true, [v].concat(injections.map(v => v.concat(makeInjectionsMeta))))
          : [v])
        .map((set, i) => set.map((elem, j) => [iterIndex, i, j, elem, 'n']))

      return _elementsOriginal[theSelector] = theElementsOriginal
    }
  }

  const valuePicker = function(valueSets, styleRules) {

    const valueRegex = new RegExp('%%(.+)%%(\\d+)%%(\\d+)%%')

    const pickStyle = function(elements) {

      for (let i = elements.length - 1; i >= 0 ;i--) {

        let m
        if (m = elements[i].match(valueRegex)) {
          const valueSetName = m[1]
          const valueSubSet  = Number(m[2])
          const valueIndex   = Number(m[3])

          const theValue = styleRules.find(v =>
            (v[1] == star || v[1] === valueSetName) &&
            (v[2] == star || v[2] === valueSubSet) &&
            (v[3] == star || v[3] === valueIndex)
          )

          if (theValue !== undefined) {
            return theValue[0]
          }

        }
      }

      return null
    }

    const pickValue = function(name, colorRules, classRules) {

      const m = name.match(valueRegex)

      if (!m) {
        return name
      }

      const valueSetName = m[1]
      const valueSubSet  = Number(m[2])
      const valueIndex   = Number(m[3])

      let theValue
      try {
        theValue = valueSets[valueSetName][valueSubSet].values[valueIndex]
        if (theValue === undefined) {
          throw 'error'
        }
      }
      catch {
        return null
      }

      const theColor = colorRules ? colorRules.find(v =>
        (v[1] == star || v[1] === valueSetName) &&
        (v[2] == star || v[2] === valueSubSet) &&
        (v[3] == star || v[3] === valueIndex)) : null

      const theClass = classRules ? classRules.find(v =>
        (v[1] == star || v[1] === valueSetName) &&
        (v[2] == star || v[2] === valueSubSet) &&
        (v[3] == star || v[3] === valueIndex)) : null

      const theColorCss = theColor ? ` style="color: ${theColor[0]}"` : ''
      const theClassCss = theClass ? ` class="${theClass[0]}"` : ''

      const result = `<span${theColorCss}${theClassCss}>${theValue}</span>`

      return result
    }

    return {
      pickStyle: pickStyle,
      pickValue: pickValue,
    }
  }

  const stylingsAccessor = function(styleDefinitions, randomIndices) {

    const defaultStyle = styleDefinitions.find(v => v.name === 'default').stylings

    const propAccessor = function(appliedStyleName, ruleStyleName=null, theDefaultStyle=defaultStyle) {

      const theAppliedStyle = appliedStyleName
        ? styleDefinitions.find(v => v.name === appliedStyleName).stylings
        : null

      const theRuleStyle = ruleStyleName
        ? styleDefinitions.find(v => v.name === ruleStyleName).stylings
        : null

      const getProp = function(propName=null, propNameSub=null) {

        if (propName && propNameSub) {

          if (theRuleStyle && theRuleStyle[propName] && theRuleStyle[propName][propNameSub] !== undefined) {
            return theRuleStyle[propName][propNameSub]
          }
          else if (theAppliedStyle && theAppliedStyle[propName] && theAppliedStyle[propName][propNameSub] !== undefined) {
            return theAppliedStyle[propName][propNameSub]
          }
          else {
            return theDefaultStyle[propName][propNameSub]
          }

        }
        else if (propName) {

          if (theRuleStyle && theRuleStyle[propName] !== undefined) {
            return theRuleStyle[propName]
          }
          else if (theAppliedStyle && theAppliedStyle[propName] !== undefined) {
            return theAppliedStyle[propName]
          }
          else {
            return theDefaultStyle[propName]
          }

        }
        else {
          return theRuleStyle || theAppliedStyle || theDefaultStyle
        }
      }

      let currentIndex

      const getNextIndex = function(type /* colors or classes */) {

        let theIndex
        const theProp = getProp(type)
        const propValueLength = getProp(type, 'values').length

        if (currentIndex === undefined) {
          if (theProp.collectiveIndexing && theProp.randomStartIndex) {

            if (theProp.randomIndices.length === 0) {
              theIndex = Math.floor(Math.random() * propValueLength)
              theProp.randomIndices.push(theIndex)
            }
            else {
              theIndex = theProp.nextIndex === 0
                ? theProp.randomIndices[0]
                : theProp.nextIndex % propValueLength
            }
          }

          else if (theProp.collectiveIndexing) {
            theIndex = theProp.nextIndex % propValueLength
          }

          else if (theProp.randomStartIndex) {

            if (!theProp.setIndex) {
              theProp.setIndex = 0
            }

            theIndex = theProp.randomIndices[theProp.setIndex]

            if (theIndex === undefined) {
              theIndex = Math.floor(Math.random() * propValueLength)
              theProp.randomIndices.push(theIndex)
            }

            theProp.setIndex += 1
          }

          else {
            theIndex = 0
          }
        }

        else {
          theIndex = ++currentIndex % propValueLength
        }

        currentIndex = theIndex
        theProp.nextIndex = currentIndex + 1

        return theIndex
      }

      return {
        getProp: getProp,
        getNextIndex: getNextIndex,
      }

    }

    const importIndices = function() {

      styleDefinitions
        .forEach(def => {
          ;['colors', 'classes'].forEach(type => {
            def.stylings[type].randomIndices = randomIndices[def.name]
              ? randomIndices[def.name][type]
              : []
            def.stylings[type].nextIndex = 0
          })
        })
    }

    const exportIndices = function() {
      const result = {}

      styleDefinitions
        .forEach(def => {
          result[def.name] = {}

          ;['colors', 'classes'].forEach(type => {
            result[def.name][type] = def.stylings[type].randomIndices
          })
        })

      return result
    }

    importIndices()

    return {
      defaultStyle: defaultStyle,
      propAccessor: propAccessor,
      exportIndices: exportIndices,
    }
  }

  const renderSets = function(
    reordering,
    styleDefinitions,
    styleApplications,
    styleRules,
    randomIndices,
    valueSets,
    numberedSets,
    theSelector=inputSyntax.cssSelector
  ) {

    const sa = stylingsAccessor(styleDefinitions, randomIndices)
    const vp = valuePicker(valueSets, styleRules)

    const stylizedResults = Array(reordering.length)

    for (const set of reordering) {

      const actualValues = []
      const styleName = styleApplications[set.order]
      const pa = sa.propAccessor(styleName, vp.pickStyle(set
        .rendering
        .map(v => v[3])
      ))

      if (pa.getProp('display') === 'sort') {
        set.rendering.sort()
      }
      else if (pa.getProp('display') === 'orig') {
        set.rendering = numberedSets.find(v => v.name === set.order).elements
      }

      for (const elem of set.rendering) {

        const [
          _,
          setIndex,
          elemIndex,
          elemContent,
          elemType,
        ] = elem


        if (elemType !== 'd') {
          const theIndex = pa.getNextIndex('colors')

          const colorChoice = !Number.isNaN(theIndex)
            ? ` color: ${pa.getProp('colors', 'values')[theIndex]};`
            : ''

          const className = `class="set-randomizer--element set-randomizer--element-index-${setIndex}-${elemIndex}"`
          const blockDisplay = pa.getProp('block')
            ? ' display: block;'
            : ''

          const style = `style="padding: 0px ${pa.getProp('fieldPadding')}px;${colorChoice}${blockDisplay}"`

          const pickedValue = vp.pickValue(elemContent, pa.getProp('colors', 'rules'), pa.getProp('classes', 'rules'))

          if (pickedValue) {

            const filterHtml = pa.getProp('filter')
            const displayBlock = pa.getProp('block')

            const theValue = filterHtml
              ? displayBlock
                ? `<record ${className} ${style}><div>${treatNewlines(pickedValue).replace(htmlTagsNoBrRegex, '')}</div></record>`
                : `<record ${className} ${style}>${pickedValue.replace(htmlTagsRegex, '')}</record>`
              : displayBlock
                ? `<record ${className} ${style}><div>${treatNewlines(pickedValue)}</div></record>`
                : `<record ${className} ${style}>${pickedValue}</record>`

            actualValues.push(theValue)
          }
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
      else if (pa.getProp('display') === 'meta') {
        stylizedResults[set.order] = null
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
      if (stylizedResults[i] !== null /* when display:meta */) {
        theRawStructure = theRawStructure
          .replace(
            (inputSyntax.isRegex
              ? new RegExp(`${inputSyntax.openDelim}${escapeString(value)}${inputSyntax.closeDelim}`)
              : `${inputSyntax.openDelim}${value}${inputSyntax.closeDelim}`),
            `${stylizedResults[i]}`
          )
      }
    }

    const theHtml = getHtml(theSelector)

    theRawStructure
      .split(elemDelim)
      .forEach((v, i) => theHtml[i].innerHTML = v)

    if (theSelector === 'div#clozed') {
      const olParse = getElementsOriginal('div#original').flat()

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
    getElementsOriginal: getElementsOriginal,
    renderSets: renderSets,
    isInvalid: isInvalid,
    isContained: isContained,
  }
}
