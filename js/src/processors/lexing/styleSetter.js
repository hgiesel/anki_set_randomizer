import {
  partitionList,
  getBool,
  simpleStringToList,
} from './kwargs.js'

import {
  vs,
} from '../../types.js'

import {
  valueSetName,
} from './grammar/patterns.js'

import {
  preprocessVs,
} from './preprocess.js'

const initStyle = name => ({
  name: name,
  stylings: {
    colors: {},
    classes: {},
  }
})

const noneStyle = initStyle('none')
noneStyle.stylings.display = 'none'

const metaStyle = initStyle('meta')
metaStyle.stylings.display = 'meta'

const emptyStyle = initStyle('empty')
emptyStyle.stylings.display = 'empty'

const blockStyle = initStyle('block')
blockStyle.stylings.openDelim = ''
blockStyle.stylings.closeDelim = ''
blockStyle.stylings.fieldPadding = 0
blockStyle.stylings.display = 'block'

const defaultStyleDefinitions = [
  noneStyle,
  metaStyle,
  emptyStyle,
  blockStyle,
]

export default function styleSetter(defaultStyle) {
  const styleDefinitions = [{
    name: 'default',
    stylings: defaultStyle,
  }].concat(defaultStyleDefinitions)

  const setStyleAttribute = function(name, attributeName, attributeValue) {
    const sd = styleDefinitions.find(v => v.name === name)
      || styleDefinitions[styleDefinitions.push(initStyle(name)) - 1]

    let value = null

    switch (attributeName) {
      case 'openDelim':
        sd.stylings.openDelim = attributeValue
        break

      case 'closeDelim':
        sd.stylings.closeDelim = attributeValue
        break

      case 'fieldSeparator':
        sd.stylings.fieldSeparator = attributeValue
        break

      case 'fieldPadding':
        if ((value = Number(attributeValue)) >= 0) {
          sd.stylings.fieldPadding = value
        }
        break

      case 'emptySet':
        sd.stylings.emptySet = attributeValue
        break

      case 'colors':
        sd.stylings.colors.values = simpleStringToList(attributeValue)
        break

      case 'classes':
        sd.stylings.classes.values = simpleStringToList(attributeValue)
        break

      case 'colorRules':
        sd.stylings.colors.rules = partitionList(
          simpleStringToList(attributeValue), 2, true
        )
          .map(([vsText, colorText]) => {
            const regexResult = vsText.match(`^${valueSetName}$`)
            const vsVal = preprocessVs(regexResult ? regexResult.slice(1) : [/* invalid vs */])

            return [vsVal, colorText]
          })
          .filter(([vsVal/*, color */]) => vsVal.type === vs.some)
        break

      case 'classRules':
        sd.stylings.classes.rules = partitionList(
          simpleStringToList(attributeValue), 2, true
        )
          .map(([vsText, classText]) => {
            const regexResult = vsText.match(`^${valueSetName}$`)
            const vsVal = preprocessVs(regexResult ? regexResult.slice(1) : [/* invalid vs */])

            return [vs, classText]
          })
          .filter(([vsVal/*, class */]) => vsVal.type === vs.some)
        break

      case 'colorCi':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.colors.collectiveIndexing = value
        }
        break

      case 'colorRsi':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.colors.randomStartIndex = value
        }
        break

      case 'classCi':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.classes.collectiveIndexing = value
        }
        break

      case 'classRsi':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.classes.randomStartIndex = value
        }
        break

      case 'colorDelim':
        sd.stylings.colors.delim = attributeValue
        break

      case 'classDelim':
        sd.stylings.classes.delim = attributeValue
        break

      case 'block':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.block = value
        }
        break

      case 'filterTags':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.filterTags = value
        }
        break

      case 'display':
        sd.stylings.display = attributeValue
        break

        ////////// OCCLUSION SPECIFIC ATTRIBUTES

      case 'stroke':
        sd.stylings.stroke = attributeValue
        break

      case 'strokeWidth':
        if ((value = Number(attributeValue)) >= 0) {
          sd.stylings.strokeWidth = value
        }
        break

      case 'strokeOpacity':
        if ((value = Number(attributeValue)) >= 0) {
          sd.stylings.strokeOpacity = value
        }
        break

      case 'fill':
        sd.stylings.fill = attributeValue
        break

      case 'fillOpacity':
        if ((value = Number(attributeValue)) >= 0) {
          sd.stylings.fillOpacity = value
        }
        break

      default:
        // throw invalid key away
    }
  }

  const setAttributes = function(name, options) {
    for (const attributeName in options) {
      setStyleAttribute(name, attributeName, options[attributeName])
    }
  }

  const exportStyleDefinitions = () => styleDefinitions

  return {
    setAttributes: setAttributes,
    exportStyleDefinitions: exportStyleDefinitions,
  }
}
