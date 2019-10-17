import {
  namePattern,
  positionPattern,
  getCorrespondingSets,
  partitionList,
  star,
} from './util.js'

const valueSetPattern = `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)`

export function processRenderDirectives(elements, defaultStyle, namedSets) {

  const styleDefinitions  = processStyleDefinitions(elements, defaultStyle)
  const styleApplications = processStyleApplications(elements, styleDefinitions, namedSets)
  const styleRules        = processStyleRules(elements, styleDefinitions)

  return [styleDefinitions, styleApplications, styleRules]
}

function getBool(attributeValue) {
  const bool = attributeValue === 'true' || attributeValue === 'yes'
    ? true
    : attributeValue === 'false' || attributeValue === 'no'
    ? false
    : null

  return bool
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

  const styleDefinitions  = [
    {
      name: 'default',
      stylings: defaultStyle,
    },
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
    },
  ]

  const styleRegex = new RegExp(
    `^\\$(?:style|s)\\(` +
    `(${namePattern})` +
    `\\s*,\\s` +
    `(.*)` + // styling directives
    `\\)$`
  )

  elements
    .flat()
    .map(v => [v, v[3].match(styleRegex)])
    .filter(v => v[1])
    .forEach(v => {

      const [
        _,
        name,
        stylingDirectives,
      ] = v[1]

      let sd = styleDefinitions.find(v => v.name === name)

      if (!sd) {
        const idx = styleDefinitions.push({
          name: name,
          stylings: {
            colors: {},
            classes: {},
          }
        })

        sd = styleDefinitions[idx - 1]
      }

      splitStylingDirectives(stylingDirectives)
        .forEach(v => {

          const [
            attributeName,
            attributeValue,
          ] = v

          let value

          switch (attributeName) {
            case 'od': case 'openDelim':
              sd.stylings['openDelim'] = attributeValue
              break

            case 'cd': case 'closeDelim':
              sd.stylings['closeDelim'] = attributeValue
              break

            case 'fs': case 'fieldSeparator':
              sd.stylings['fieldSeparator'] = attributeValue
              break

            case 'fp': case 'fieldPadding':

              if ((value = Number(attributeValue)) >= 0) {
                sd.stylings['fieldPadding'] = value
              }
              break

            case 'es': case 'emptySet':
              sd.stylings['emptySet'] = attributeValue
              break

            case 'clrs': case 'colors':
              sd.stylings['colors']['values'] = attributeValue
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0)
              break

            case 'clss': case 'classes':
              sd.stylings['classes']['values'] = attributeValue
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0)
              break

            case 'clrr': case 'colorRules':
              sd.stylings['colors']['rules'] = partitionList(attributeValue
                .split(',')
                .map(w => w.trim()), 2
              )
                .map(w => {

                  if (w.length !== 2) {
                    return w
                  }

                  const regexResult = w[1].match(`^${valueSetPattern}$`)

                  if (!regexResult) {
                    return null
                  }

                  const [
                    _,
                    valueSetName,
                    valueSetSetIndex,
                    valueSetSetStar,
                    valueSetValueIndex,
                    valueSetValueStar,
                  ] = regexResult

                  return [
                    w[0],
                    valueSetName === '*' ? star : valueSetName,
                    valueSetSetIndex ? Number(valueSetSetIndex) : star,
                    valueSetValueIndex ? Number(valueSetValueIndex) : star,
                  ]
                })
                .filter(w => w && w.length === 4)

            case 'clsr': case 'classRules':
              sd.stylings['classes']['rules'] = partitionList(attributeValue
                .split(',')
                .map(w => w.trim()), 2
              )
                .map(w => {

                  if (w.length !== 2) {
                    return w
                  }

                  const regexResult = w[1].match(`^${valueSetPattern}$`)

                  if (!regexResult) {
                    return null
                  }

                  const [
                    _,
                    valueSetName,
                    valueSetSetIndex,
                    valueSetSetStar,
                    valueSetValueIndex,
                    valueSetValueStar,
                  ] = regexResult

                  return [
                    w[0],
                    valueSetName === '*' ? star : valueSetName,
                    valueSetSetIndex ? Number(valueSetSetIndex) : star,
                    valueSetValueIndex ? Number(valueSetValueIndex) : star,
                  ]
                })
                .filter(w => w && w.length === 4)

            case 'clrci': case 'colorsCollectiveIndexing':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['colors']['collectiveIndexing'] = value
              }
              break;

            case 'clrrsi': case 'colorsRandomStartIndex':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['colors']['randomStartIndex'] = value
              }
              break;

            case 'clsci': case 'classesCollectiveIndexing':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['classes']['collectiveIndexing'] = value
              }
              break;

            case 'clsrsi': case 'classesRandomStartIndex':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['classes']['randomStartIndex'] = value
              }
              break;

            case 'blk': case 'block':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['block'] = value
              }
              break;

            case 'fltr': case 'filter':

              if (typeof (value = getBool(attributeValue)) === 'boolean') {
                sd.stylings['filter'] = value
              }
              break;

            case 'dp': case 'display':
              sd.stylings['display'] = attributeValue
              break;
          }
        })
    })

  return styleDefinitions
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
    .map(v => [v, v[3].match(applyRegex)])
    .filter(v => v[1])
    .forEach(v => {

      const [
        _,
        stylingName,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[1]

      if (styleDefinitions.find(v => v.name === stylingName)) {
        const correspondingSets = getCorrespondingSets(
          elements,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0][1],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )

        correspondingSets
          .forEach(set => {
            styleApplications[set] = stylingName
          })
      }
    })

  return styleApplications
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

  const styleRules = []
  elements
    .flat()
    .map(v => [v, v[3].match(ruleRegex)])
    .filter(v => v[1])
    .forEach(v => {

      const [
        _,
        stylingName,
        valueSetName,
        valueSetSetIndex,
        valueSetSetStar,
        valueSetValueIndex,
        valueSetValueStar,
      ] = v[1]

      if (styleDefinitions.find(v => v.name === stylingName)) {

        const vssi = Number(valueSetSetIndex)
        const vsvi = Number(valueSetValueIndex)

        styleRules.push([
          stylingName,
          valueSetName === '*' ? star : valueSetName,
          valueSetSetIndex ? vssi : star,
          valueSetValueIndex ? vsvi : star,
        ])
      }
    })

  return styleRules
}
