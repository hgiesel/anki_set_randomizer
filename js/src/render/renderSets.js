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

    const theColor = colorRules
      ? colorRules.find(([/* color */, rule]) => (
        (rule.name === vsStar || rule.name === vs.name)
          && (rule.sub === vsStar || rule.sub === vs.sub)
          && (rule.pos === vsStar || rule.pos === vs.pos)
      ))
      : null

    const theClass = classRules
      ? colorRules.find(([/* class */, rule]) => (
        (rule.name === vsStar || rule.name === vs.name)
          && (rule.sub === vsStar || rule.sub === vs.sub)
          && (rule.pos === vsStar || rule.pos === vs.pos)
      ))
      : null

    const theColorCss = theColor
      ? ` style="color: ${theColor[0]}"`
      : ''

    const theClassCss = theClass
      ? ` class="${theClass[0]}"`
      : ''

    return `<span${theColorCss}${theClassCss}>${theValue}</span>`
  }

  return {
    pickValue: pickValue,
  }
}

export const renderSets = function(
  numberedSets,
  reordering,
  valueSets,
  styleAccessor,
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
      set.rendering = numberedSets.find(v => v.name === set.order).elements
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

        const pickedValue = vp.pickValue(elemContent, pa.getProp(['colors', 'rules']), pa.getProp(['classes', 'rules']))

        if (pickedValue) {
          const filterHtml = pa.getProp(['filter'])
          const displayBlock = pa.getProp(['block'])

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

    if (pa.getProp(['display']) === 'none') {
      stylizedResults[set.order] = ''
    }
    else if (actualValues.length === 0 || pa.getProp(['display']) === 'empty') {
      stylizedResults[set.order] = (
        `${pa.getProp(['openDelim'])}`
        + `${pa.getProp(['emptySet'])}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
    else if (pa.getProp(['display']) === 'meta') {
      stylizedResults[set.order] = null
    }
    else {
      stylizedResults[set.order] = (
        `${pa.getProp(['openDelim'])}`
        + `${actualValues.join(pa.getProp(['fieldSeparator']))}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
  }

  return stylizedResults
}
