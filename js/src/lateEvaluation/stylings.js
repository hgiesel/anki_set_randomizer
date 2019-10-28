import {
  valueSetPattern,
} from '../processors/util.js'

import {
  getCorrespondingSets,
} from './util.js'

import {
  star,
} from '../util.js'

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

export function processStyle(ss, name, stylingDirectives) {

  splitStylingDirectives(stylingDirectives)
    .forEach(attribute => {

      const [
        attributeName,
        attributeValue,
      ] = attribute

      console.log('vvv', name, attributeName, attributeValue)
      ss.setStyleAttribute(name, attributeName, attributeValue)
    })
}

// processApplication(elem[1], elements, namedSets, styleApplications, styleDefinitions, ...match.slice(1))
// processStyleRule(styleDefinitions, ...match.splice(1))

export function processApplication(
  currentPos,
  elements,
  namedSets,
  styleApplications /* modified */,
  styleDefinitions,

  // ruleVs,
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

export function processStyleRule(
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
