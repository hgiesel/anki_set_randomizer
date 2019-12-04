import {
  treatNewlines,
} from './util.js'

import {
  elem, vs, extract,
} from '../types.js'

const treatValue = function(value, block, filter) {
  return block && filter
    ? `<div>${treatNewlines(value).replace(filter, '')}</div>`
    : block
    ? `<div>${treatNewlines(value)}</div>`
    : filter
    ? value.replace(filter, '')
    : value
}

const getHtmlTagsRegex = function(restrictTags, excludeTags) {
  const restrictRegex = `(?:${restrictTags.join('|')})`
  const excludeRegex = `(?:${excludeTags.join('|')})`

  const resultRegex = new RegExp(
    `<(?=\\/?${restrictRegex})(?!\\/?${excludeRegex})[^>]*>`,
    'gu',
  )

  return resultRegex
}

const elementResolver = function(valueSets) {
  const resolveElem = function(element, colorRules, classRules) {
    switch (element.type) {
      case elem.value:
        const vsData = extract(element)

        // cannot be invalid, because wouldn't be expanded otherwise
        const theValue = valueSets[vsData.name][vsData.sub].values[vsData.pos]

        const theColor = colorRules.find(([ruleData /*, color */]) => (
          (ruleData.name === vs.star || ruleData.name === vsData.name)
          && (ruleData.sub === vs.star || ruleData.sub === vsData.sub)
          && (ruleData.pos === vs.star || ruleData.pos === vsData.pos)
        ))

        const theColorCss = theColor
          ? ` style="color: ${theColor[1]}"`
          : ''

        const theClass = classRules.find(([ruleData /*, class */]) => (
          (ruleData.name === vs.star || ruleData.name === vsData.name)
          && (ruleData.sub === vs.star || ruleData.sub === vsData.sub)
          && (ruleData.pos === vs.star || ruleData.pos === vsData.pos)
        ))

        const theClassCss = theClass
          ? ` class="${theClass[1]}"`
          : ''

        return `<span${theColorCss}${theClassCss}>${theValue}</span>`

      case elem.text: default:
        return extract(element)
    }
  }

  return {
    resolveElem: resolveElem,
  }
}

const wrapWithSetTag = function(delimColor, delimClass, text) {
  const delimClr = delimColor ? ` style="color: ${delimColor}"` : ''
  const delimCls = delimClass ? ` class="${delimClass}"` : ''

  return `<set${delimClr}${delimCls}>${text}</set>`
}

export const renderSets = function(
  reordering,
  valueSets,
  styleAccessor,
  elements,
) {
  const er = elementResolver(valueSets)

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

        const className = ` class="sr--element sr---index-${setIndex}-${elemIndex}"`
        const blockDisplay = pa.getProp(['block'])
          ? ' display: block;'
          : ''

        const style = ` style="padding: 0px ${pa.getProp(['fieldPadding'])}px;${colorChoice}${blockDisplay}"`

        const resolvedElem = er.resolveElem(elemContent, pa.getProp(['colors', 'rules'], [/* preds */], [/* default */]), pa.getProp(['classes', 'rules'], [/* preds */], [/* default */]))

        if (resolvedElem) {
          const newContent = treatValue(
            resolvedElem,
            pa.getProp(['block']),
            pa.getProp(['filterTags'])
              ? getHtmlTagsRegex(
                pa.getProp(['filterTagsRestricted'], [/* preds */], []),
                pa.getProp(['filterTagsExcluded'], [/* preds */], ['br']),
              )
              : null,
          )

          const theValue = `<elem${className}${style}>${newContent}</elem>`
          actualValues.push(theValue)
        }
      }
    }

    if (pa.getProp(['display']) === 'none') {
      stylizedResults[set.order] = ''
    }
    else if (actualValues.length === 0 || pa.getProp(['display']) === 'empty') {
      stylizedResults[set.order] = wrapWithSetTag(pa.getProp(['colors', 'delim']), pa.getProp(['classes', 'delim']),
        `${pa.getProp(['openDelim'])}`
        + `${pa.getProp(['emptySet'])}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
    else if (pa.getProp(['display']) === 'meta') {
      stylizedResults[set.order] = null
    }
    else {
      stylizedResults[set.order] = wrapWithSetTag(pa.getProp(['colors', 'delim']), pa.getProp(['classes', 'delim']),
        `${pa.getProp(['openDelim'])}`
        + `${actualValues.join(pa.getProp(['fieldSeparator']))}`
        + `${pa.getProp(['closeDelim'])}`
      )
    }
  }

  return stylizedResults
}
