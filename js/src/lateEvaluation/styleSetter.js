import {
  partitionList,
  getBool,
} from './util.js'

import {
  vsSome,
} from '../util.js'

import {
  valueSetName,
} from '../processors/util.js'

import {
  preprocessVs,
} from '../processors/preprocess.js'

const initStyle = name => ({
  name: name,
  stylings: {
    colors: {},
    classes: {},
  }
})

const noneStyle = initStyle('none')
noneStyle.display = 'none'

const metaStyle = initStyle('meta')
noneStyle.display = 'meta'

const blockStyle = initStyle('block')
blockStyle.openDelim = ''
blockStyle.closeDelim = ''
blockStyle.fieldPadding = 0
noneStyle.display = 'block'

const defaultStyleDefinitions = [
  noneStyle,
  metaStyle,
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
        sd.stylings.colors.values = attributeValue
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0)
        break

      case 'classes':
        sd.stylings.classes.values = attributeValue
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0)
        break

      case 'colorRules':
        sd.stylings.colors.rules = partitionList(attributeValue
          .split(',')
          .map(w => w.trim()), 2, true)
          .map(([vsText, colorText]) => {
            const regexResult = vsText.match(`^${valueSetName}$`)
            const vs = preprocessVs(regexResult ? regexResult.slice(1) : [/* invalid vs */])

            return [vs, colorText]
          })
          .filter(([vs/*, color */]) => vs.type === vsSome)
        break

      case 'classRules':
        sd.stylings.classes.rules = partitionList(attributeValue
          .split(',')
          .map(w => w.trim()), 2, true)
          .map(([vsText, classText]) => {
            const regexResult = vsText.match(`^${valueSetName}$`)
            const vs = preprocessVs(regexResult ? regexResult.slice(1) : [/* invalid vs */])

            return [vs, classText]
          })
          .filter(([vs/*, class */]) => vs.type === vsSome)
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

      case 'block':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.block = value
        }
        break

      case 'filter':
        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.filter = value
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

  const exportStyleDefinitions = () => styleDefinitions

  return {
    setStyleAttribute: setStyleAttribute,
    exportStyleDefinitions: exportStyleDefinitions,
  }
}
