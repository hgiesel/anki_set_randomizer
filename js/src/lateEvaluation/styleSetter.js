import {
  partitionList,
  getBool,
} from './util.js'

import {
  valueSetPattern,
} from '../processors/util.js'

import {
  star,
} from '../util.js'

const defaultStyleDefinitions = [
  {
    name: 'none',
    stylings: {
      colors: {},
      classes: {},
      display: 'none',
    },
  },
  {
    name: 'meta',
    stylings: {
      colors: {},
      classes: {},
      display: 'meta',
    },
  },
  {
    name: 'block',
    stylings: {
      colors: {},
      classes: {},
      openDelim: '',
      closeDelim: '',
      fieldPadding: 0,
      block: true,
    },
  }
]

export default function styleSetter(defaultStyle) {
  const styleDefinitions = [{
    name: 'default',
    stylings: defaultStyle,
  }].concat(defaultStyleDefinitions)

  const setStyleAttribute = function(name, attributeName, attributeValue) {
    let theStyle = null
    const sd = (theStyle = styleDefinitions.find(v => v.name === name))
      ? theStyle
      : styleDefinitions[styleDefinitions.push({
        name: name,
        stylings: {
          colors: {},
          classes: {},
        }
      }) - 1]

    let value = null

    switch (attributeName) {
      case 'od': case 'openDelim':
        sd.stylings.openDelim = attributeValue
        break

      case 'cd': case 'closeDelim':
        sd.stylings.closeDelim = attributeValue
        break

      case 'fs': case 'fieldSeparator':
        sd.stylings.fieldSeparator = attributeValue
        break

      case 'fp': case 'fieldPadding':
        if ((value = Number(attributeValue)) >= 0) {
          sd.stylings.fieldPadding = value
        }
        break

      case 'es': case 'emptySet':
        sd.stylings.emptySet = attributeValue
        break

      case 'clrs': case 'colors':
        sd.stylings.colors.values = attributeValue
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0)
        break

      case 'clss': case 'classes':
        sd.stylings.classes.values = attributeValue
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0)
        break

      case 'clrr': case 'colorRules':
        sd.stylings.colors.rules = partitionList(attributeValue
          .split(',')
          .map(w => w.trim()), 2)
          .map((w) => {
            if (w.length !== 2) {
              return w
            }

            const regexResult = w[1].match(`^${valueSetPattern}$`)

            if (!regexResult) {
              return null
            }

            const [
              /* */,
              valueSetName,
              valueSetSetIndex,
              /* valueSetSetStar */,
              valueSetValueIndex,
              /* valueSetValueStar */,
            ] = regexResult

            return [
              w[0],
              valueSetName === '*' ? star : valueSetName,
              valueSetSetIndex ? Number(valueSetSetIndex) : star,
              valueSetValueIndex ? Number(valueSetValueIndex) : star,
            ]
          })
          .filter(w => w && w.length === 4)
        break

      case 'clsr': case 'classRules':
        sd.stylings.classes.rules = partitionList(attributeValue
          .split(',')
          .map(w => w.trim()), 2)
          .map((w) => {
            if (w.length !== 2) {
              return w
            }

            const regexResult = w[1].match(`^${valueSetPattern}$`) /* TODO to helper function */

            if (!regexResult) {
              return null
            }

            const [
              /* */,
              valueSetName,
              valueSetSetIndex,
              /* valueSetSetStar */,
              valueSetValueIndex,
              /* valueSetValueStar */,
            ] = regexResult

            return [
              w[0],
              valueSetName === '*' ? star : valueSetName,
              valueSetSetIndex ? Number(valueSetSetIndex) : star,
              valueSetValueIndex ? Number(valueSetValueIndex) : star,
            ]
          })
          .filter(w => w && w.length === 4)
        break

      case 'clrci': case 'colorsCollectiveIndexing':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.colors.collectiveIndexing = value
        }
        break

      case 'clrrsi': case 'colorsRandomStartIndex':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.colors.randomStartIndex = value
        }
        break

      case 'clsci': case 'classesCollectiveIndexing':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.classes.collectiveIndexing = value
        }
        break

      case 'clsrsi': case 'classesRandomStartIndex':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.classes.randomStartIndex = value
        }
        break

      case 'blk': case 'block':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.block = value
        }
        break

      case 'fltr': case 'filter':

        if (typeof (value = getBool(attributeValue)) === 'boolean') {
          sd.stylings.filter = value
        }
        break

      case 'dp': case 'display':
        sd.stylings.display = attributeValue
        break

      default:
        // invalid key
    }
  }

  const exportStyleDefinitions = () => styleDefinitions

  return {
    setStyleAttribute: setStyleAttribute,
    exportStyleDefinitions: exportStyleDefinitions,
  }
}
