/**
 * For all funtions that concerns accessing the html content
 */

import {
  star,
} from './processors/util.js'

import {
  escapeString,
  escapeHtml,
  treatNewlines,
} from './util.js'

export default function formatter(inputSyntax, iterIndex) {

<<<<<<< Updated upstream
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

  const elemDelim = '%%sr%%ELEMDELIM%%'

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
=======
  let _rawStructure = {}
  const exprRegex = RegExp(
    `${escapeString(options.inputSyntax.openDelim)}` +
    `((?:.|\n|\r)*?)` + // match everything including newlines
    `${escapeString(options.inputSyntax.closeDelim)}`, 'g')
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
      const rawStructure = []
>>>>>>> Stashed changes

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
      const theElementsOriginal = []
      const theFoundStructure = getFoundStructure(theSelector)

      for (const [i, group] of theFoundStructure.entries()) {
        const splitGroup = group
          .split(inputSyntax.isRegex
            ? new RegExp(inputSyntax.fieldSeparator)
            : inputSyntax.fieldSeparator)
          .map((elem, j) => [iterIndex, i, j, elem, 'n'])

        theElementsOriginal.push(splitGroup)
      }

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
          return (theRuleStyle && theRuleStyle[propName] && theRuleStyle[propName][propNameSub])
            || (theAppliedStyle && theAppliedStyle[propName] && theRuleStyle[propName][propNameSub])
            || (theDefaultStyle[propName][propNameSub])
        }
        else if (propName) {
          return (theRuleStyle && theRuleStyle[propName])
            || (theAppliedStyle && theAppliedStyle[propName])
            || (theDefaultStyle[propName])
        }
        else {
          return theRuleStyle || theAppliedStyle || theDefaultStyle
        }
      }

      let currentIndex

      const getNextIndex = function(type /* colors or classes */) {

        let theIndex
        const theProp = getProp(type)

        if (currentIndex === undefined) {
          if (theProp.collectiveIndexing && theProp.randomStartIndex) {

            if (theProp.randomIndices.length === 0) {
              theIndex = Math.floor(Math.random() * theProp.values.length)
              theProp.randomIndices.push(theIndex)
            }
            else {
              theIndex = theProp.nextIndex === 0
                ? theProp.randomIndices[0]
                : theProp.nextIndex % theProp.values.length
            }

          }

          else if (theProp.collectiveIndexing) {
            theIndex = (theProp.nextIndex) % theProp.values.length
          }

          else if (theProp.randomStartIndex) {

            if (!theProp.setIndex) {
              theProp.setIndex = 0
            }

            theIndex = theProp.randomIndices[theProp.setIndex]

            if (theIndex === undefined) {
              theIndex = Math.floor(Math.random() * theProp.values.length)
              theProp.randomIndices.push(theIndex)
            }

            theProp.setIndex += 1
          }

          else {
            theIndex = 0
          }
        }

        else {
          theIndex = ++currentIndex % theProp.values.length
        }

        currentIndex = theIndex
        theProp.nextIndex = currentIndex + 1

        return theIndex
      }

<<<<<<< Updated upstream
      return {
        getProp: getProp,
        getNextIndex: getNextIndex,
      }
=======
      const theFieldSeparator = customRendering.fieldSeparator === undefined
        ? options.outputSyntax.fieldSeparator
        : customRendering.fieldSeparator
      const theFieldPadding  = customRendering.fieldPadding === undefined
        ? options.fieldPadding
        : customRendering.fieldPadding

      const theOpenDelim =
        '<section style="display: inline;" class="set-randomizer--open-delim">\n' +
        (customRendering.openDelim === undefined
          ? options.outputSyntax.openDelim
          : customRendering.openDelim) + '\n' +
        '</section>\n'

      const theCloseDelim =
        '<section style="display: inline;" class="set-randomizer--close-delim">\n' +
        (customRendering.closeDelim === undefined
          ? options.outputSyntax.closeDelim
          : customRendering.closeDelim) + '\n' +
        '</section>\n'

>>>>>>> Stashed changes

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

          const colorChoice = pa.getProp('colors', 'values')
            ? ` color: ${pa.getProp('colors', 'values')[theIndex]};`
            : ''

          const className = `class="set-randomizer--element set-randomizer--element-index-${setIndex}-${elemIndex}"`
          const blockDisplay = pa.getProp('block')
            ? ' display: block;'
            : ''

<<<<<<< Updated upstream
          const style = `style="padding: 0px ${pa.getProp('fieldPadding')}px;${colorChoice}${blockDisplay}"`

          const pickedValue = vp.pickValue(elemContent, pa.getProp('colors', 'rules'), pa.getProp('classes', 'rules'))

          if (pickedValue) {

            const theValue = pa.getProp('block')
              ? `<record ${className} ${style}><div>${treatNewlines(elemContent)}</div></record>`
              : `<record ${className} ${style}>${pickedValue}</record>`

            actualValues.push(theValue)
          }
=======
          const className   = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`
          const colorChoice = theColors[theIndex] ? ` color: ${theColors[theIndex]};` : ''
          const blockStyle  = customRendering.display === 'block' ? ' display: block;' : ''

          const style       = `style="padding: 0px ${theFieldPadding}px;${colorChoice}${blockStyle}"`

          actualValues.push(
            `<section ${className} ${style}>\n` +
            `${element[2]}\n` +
            `</section>\n`
          )
>>>>>>> Stashed changes
        }
      }

      if (pa.getProp('display') === 'none') {
        stylizedResults[set.order] = ''
      }
<<<<<<< Updated upstream
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
=======
      else if (actualValues.length === 0 || customRendering.display === 'empty') {
        stylizedResults[set.order] =
        `${theOpenDelim}\n` +
        `${options.outputSyntax.emptySet}\n` +
        `${theCloseDelim}\n`
      }
      else {
        console.log(
          `${theOpenDelim}\n` +
          `${actualValues.join(theFieldSeparator)}\n` +
          `${theCloseDelim}\n`
        )
        stylizedResults[set.order] =
          `${theOpenDelim}\n` +
          `${actualValues.join(theFieldSeparator)}\n` +
          `${theCloseDelim}\n`
      }

      if (customRendering.colors !== undefined) {
        absoluteIndex = absoluteIndexSave
>>>>>>> Stashed changes
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

    console.log(sa.exportIndices())
    return sa.exportIndices()
  }

  return {
    getElementsOriginal: getElementsOriginal,
    renderSets: renderSets,
    isValid: isValid,
  }
}
