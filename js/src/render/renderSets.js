import {
  treatNewlines,
} from './util.js'

import {
  preprocessVs,
} from '../processors/preprocess.js'

import {
  vsStar,
  isSRToken,
  fromSRToken,
} from '../util.js'

const htmlTagsRegex = (/<.*?>/gu)
const htmlTagsNoBrRegex = (/<(?!br>).*?>/gu)

const valuePicker = function(valueSets) {
  const pickValue = function(name, colorRules, classRules) {

    if (!isSRToken(name, 'value')) {
      return name
    }

    const vs = preprocessVs(fromSRToken(name))
    const theValue = valueSets[vs.name][vs.sub].values[vs.pos]

    const theColor = colorRules.find(([rule /*, color */]) => (
      (rule.name === vsStar || rule.name === vs.name)
      && (rule.sub === vsStar || rule.sub === vs.sub)
      && (rule.pos === vsStar || rule.pos === vs.pos)
    ))

    const theColorCss = theColor
      ? ` style="color: ${theColor[1]}"`
      : ''

    const theClass = classRules.find(([rule /*, class */]) => (
      (rule.name === vsStar || rule.name === vs.name)
      && (rule.sub === vsStar || rule.sub === vs.sub)
      && (rule.pos === vsStar || rule.pos === vs.pos)
    ))

    const theClassCss = theClass
      ? ` class="${theClass[1]}"`
      : ''

    return `<span${theColorCss}${theClassCss}>${theValue}</span>`
  }

  return {
    pickValue: pickValue,
  }
}

const wrapWithRecordTag = function(delimColor, delimClass, text) {
  return `<record${delimColor ? ` style="color: ${delimColor}"` : ''}${delimClass ? ` class="${delimClass}"` : ''}>${text}</record>`
}

export const renderSets = function(
  reordering,
  valueSets,
  styleAccessor,
  elements,
) {
  const vp = valuePicker(valueSets)

  const stylizedResults = Array(reordering.length)

  for (const set of reordering) {
    const actualValues = []

    const pa = styleAccessor.propAccessor(set.order)

    if (pa.getProp(['display']) === 'sort') {
      set.rendering.sort()
    }
    else if (pa.getProp(['display']) === 'orig') {
      set.rendering = elements[set.order]
    }

    for (const elem of set.rendering) {
      const [
        /* iterName */,
        setIndex,
        elemIndex,
        elemContent,
        elemType,
      ] = elem

      if (elemType !== 'd') {
        const theIndex = pa.getNextIndex('colors')

        const colorChoice = Number.isNaN(theIndex)
          ? ''
          : ` color: ${pa.getProp(['colors', 'values', theIndex], [/* preds */], '')};`

        const className = `class="set-randomizer--element set-randomizer--element-index-${setIndex}-${elemIndex}"`
        const blockDisplay = pa.getProp(['block'])
          ? ' display: block;'
          : ''

        const style = `style="padding: 0px ${pa.getProp(['fieldPadding'])}px;${colorChoice}${blockDisplay}"`

        const pickedValue = vp.pickValue(elemContent, pa.getProp(['colors', 'rules'], [/* preds */], [/* default */]), pa.getProp(['classes', 'rules'], [/* preds */], [/* default */]))

        if (pickedValue) {
          const filterTags = pa.getProp(['filterTags'])
          const displayBlock = pa.getProp(['block'])

          const theValue = filterTags
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

    if (pa.getProp(['display']) === 'none') {
      stylizedResults[set.order] = ''
    }
    else if (actualValues.length === 0 || pa.getProp(['display']) === 'empty') {
      stylizedResults[set.order] = wrapWithRecordTag(pa.getProp(['colors', 'delim']), pa.getProp(['classes', 'delim']),
        `${pa.getProp(['openDelim'])}`
        + `${pa.getProp(['emptySet'])}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
    else if (pa.getProp(['display']) === 'meta') {
      stylizedResults[set.order] = null
    }
    else {
      stylizedResults[set.order] = wrapWithRecordTag(pa.getProp(['colors', 'delim']), pa.getProp(['classes', 'delim']),
        `${pa.getProp(['openDelim'])}`
        + `${actualValues.join(pa.getProp(['fieldSeparator']))}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
  }

  return stylizedResults
}
