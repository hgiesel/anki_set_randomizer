import {
  styleSetter,
} from './styleSetter.js'

import {
  namePattern,
  positionPattern,
  getCorrespondingSets,
} from './util.js'

import {
  star,
} from '../util.js'

const valueSetPattern = `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)`

export function processRenderDirectives(elements, defaultStyle, namedSets) {

  const styleDefinitions  = processStyleDefinitions(elements, defaultStyle)
  const styleApplications = processStyleApplications(elements, styleDefinitions, namedSets)
  const styleRules        = processStyleRules(elements, styleDefinitions)

  return [styleDefinitions, styleApplications, styleRules]
}

function splitStylingDirectives(sd) {

  const result = []
  const splitRegex = new RegExp(
    `(\\w+):` +
    `(?:\\[(.*?)\\]|(?:"(.*?)"|'(.*?)'|([^,]+)))?`, 'gm')

  let m = splitRegex.exec(sd)

  while (m) {
    const theValue = [
      m[1],
      m[2] !== undefined ? m[2] :
      m[3] !== undefined ? m[3] :
      m[4] !== undefined ? m[4] :
      m[5] !== undefined ? m[5] : '',
    ]

    result.push(theValue)
    m = splitRegex.exec(sd)
  }

  return result
}

function processStyleDefinitions(elements, defaultStyle) {

  const ss = styleSetter(defaultStyle)

  const styleRegex = new RegExp(
    `^\\$(?:style|s)\\(` +
    `(${namePattern})` +
    `\\s*,\\s` +
    `(.*)` + // styling directives
    `\\)$`
  )

  elements
    .flat()
    .forEach(v => {

      let match
      if (match = v[3].match(styleRegex)) {

        const [
          _,
          name,
          stylingDirectives,
        ] = match

        splitStylingDirectives(stylingDirectives)
          .forEach(v => {

            const [
              attributeName,
              attributeValue,
            ] = v

            ss.setStyleAttribute(name, attributeName, attributeValue)
          })
      }
    })

  console.log('ssss', ss.getStyleDefinitions())
  return ss.getStyleDefinitions()
}


function processStyleApplication(
  currentPos,
  elements,
  namedSets,
  styleApplications /* modified */,
  styleDefinitions,
  stylingName,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  otherNamedSet,
  otherNamedSetPos,
) {

  if (styleDefinitions.find(v => v.name === stylingName)) {
    const correspondingSets = getCorrespondingSets(
      elements,
      namedSets,
      absolutePos,
      absolutePosFromEnd,
      currentPos,
      relativePos,
      otherNamedSet,
      otherNamedSetPos,
    )

    correspondingSets
      .forEach(set => {
        styleApplications[set] = stylingName
      })
  }
}

function processStyleApplications(elements, styleDefinitions, namedSets) {
  const applyRegex = new RegExp(
    `^\\$(?:apply|app|a)\\(` +
    `(${namePattern})` +
    `(?:\\s*,\\s` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(\\d+|n?-\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

  const styleApplications = []

  elements
    .flat()
    .forEach(elem => {

      let match

      if (match = elem[3].match(applyRegex)) {
        processStyleApplication(elem[1], elements, namedSets, styleApplications, styleDefinitions, ...match.slice(1))
      }
    })

  return styleApplications
}

function processStyleRule(
  styleDefinitions,
  stylingName, valueSetName,
  valueSetSetIndex, valueSetSetStar,
  valueSetValueIndex, valueSetValueStar,
) {

  if (styleDefinitions.find(v => v.name === stylingName)) {

    const vssi = Number(valueSetSetIndex)
    const vsvi = Number(valueSetValueIndex)

    const result = [
      stylingName,
      valueSetName === '*' ? star : valueSetName,
      valueSetSetIndex ? vssi : star,
      valueSetValueIndex ? vsvi : star,
    ]

    return [result]
  }

  return []
}

function processStyleRules(elements, styleDefinitions) {
  const ruleRegex = new RegExp(
    `^\\$(?:rule|r)\\(` +
    `(${namePattern})` +
    `(?:\\s*,\\s` +
    `(?:` + // second arg
    valueSetPattern +
    `)` +
    `)?` +
    `\\)$`
  )

  const styleRules = elements
    .flat()
    .flatMap(elem =>  {
      let match

      if (match = elem[3].match(ruleRegex)) {
        return processStyleRule(styleDefinitions, ...match.splice(1))
      }

      return []
    })

  return styleRules
}
