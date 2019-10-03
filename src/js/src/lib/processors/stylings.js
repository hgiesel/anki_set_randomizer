import {
  namePattern,
  positionPattern,
  getCorrespondingSets,
  partitionList,
  star,
} from './util.js'

const valueSetPattern = `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)`

export function processRenderDirectives(originalStructure, defaultStyle, namedSets) {

  const styleDefinitions  = processStyleDefinitions(originalStructure, defaultStyle)
  const styleApplications = processStyleApplications(originalStructure, styleDefinitions, namedSets)
  const styleRules        = processStyleRules(originalStructure, styleDefinitions)

  return [styleDefinitions, styleApplications, styleRules]
}

function splitStylingDirectives(sd) {

  const result = []
  const splitRegex = new RegExp(
    `(\\w+):` +
    `(?:\\[(.*?)\\]|(?:"(.*?)"|'(.*?)'|([^,]+)))?`, 'gm')

  let m = splitRegex.exec(sd)

  while (m) {
    console.log(m)
    result.push([m[1], m[2] || m[3] || m[4] || m[5]])
    m = splitRegex.exec(sd)
  }

  return result
}

function processStyleDefinitions(originalStructure, defaultStyle) {

  const styleDefinitions  = [
    {
      name: 'default',
      stylings: defaultStyle,
    },
    {
      name: 'none',
      stylings: {
        display: 'none',
      },
    },
    {
      name: 'block',
      stylings: {
        display: 'block',
        openDelim: '',
        closeDelim: '',
        fieldPadding: 0,
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

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(styleRegex)])
    .filter(v => v[3])
    .forEach(v => {

      const [
        _,
        name,
        stylingDirectives,
      ] = v[3]

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

          if (attributeName === 'od' || attributeName === 'openDelim') {
            sd.stylings['openDelim'] = attributeValue
          }
          else if (attributeName === 'cd' || attributeName === 'closeDelim') {
            sd.stylings['closeDelim'] = attributeValue
          }
          else if (attributeName === 'fs' || attributeName === 'fieldSeparator') {
            sd.stylings['fieldSeparator'] = attributeValue
          }
          else if (attributeName === 'fp' || attributeName === 'fieldPadding') {
            const value = Number(attributeValue)
            if (value >= 0) {
              sd.stylings['fieldPadding'] = value
            }
          }

          else if (attributeName === 'clrs' || attributeName === 'colors') {
            sd.stylings['colors']['values'] = attributeValue
              .split(',')
              .map(v => v.trim())
          }
          else if (attributeName === 'clss' || attributeName === 'classes') {
            sd.stylings['classes']['values'] = attributeValue
              .split(',')
              .map(v => v.trim())
          }

          else if (attributeName === 'clrsr' || attributeName === 'colorRules') {
            sd.stylings['colors']['rules'] = partitionList(attributeValue
              .split(',')
              .map(v => v.trim()), 2
            )
              .map((v) => {

                if (v.length !== 2) {
                  return v
                }

                const regexResult = v[1].match(`^${valueSetPattern}$`)

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
                  v[0],
                  valueSetName === '*' ? star : valueSetName,
                  valueSetSetIndex ? Number(valueSetSetIndex) : star,
                  valueSetValueIndex ? Number(valueSetValueIndex) : star,
                ]
              })
              .filter(v => v && v.length === 4)
          }
          else if (attributeName === 'clssr' || attributeName === 'classRules') {
            sd.stylings['classes']['rules'] = partitionList(attributeValue
              .split(',')
              .map(v => v.trim()), 2
            )
              .map((v) => {

                if (v.length !== 2) {
                  return v
                }

                const regexResult = v[1].match(`^${valueSetPattern}$`)

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
                  v[0],
                  valueSetName === '*' ? star : valueSetName,
                  valueSetSetIndex ? Number(valueSetSetIndex) : star,
                  valueSetValueIndex ? Number(valueSetValueIndex) : star,
                ]
              })
              .filter(v => v && v.length === 4)
          }

          else if (attributeName === 'clrsci' || attributeName === 'colorsCollectiveIndexing') {
            const bool = attributeValue === 'true' || value === 'yes'
              ? true
              : attributeValue === 'false' || value === 'no'
              ? false
              : null

            if (typeof bool === 'boolean') {
              sd.stylings['colors']['collectiveIndexing'] = bool
            }
          }

          else if (attributeName === 'clrsrsi' || attributeName === 'colorsRandomStartIndex') {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true' || value === 'yes'
              ? true
              : value === 'false' || value === 'no'
              ? false
              : null

            if (typeof bool === 'boolean') {
              sd.stylings['colors']['randomStartIndex'] = bool
            }
          }


          else if (attributeName === 'clssci' || attributeName === 'classesCollectiveIndexing') {
            const bool = attributeValue === 'true' || value === 'yes'
              ? true
              : attributeValue === 'false' || value === 'no'
              ? false
              : null

            if (typeof bool === 'boolean') {
              sd.stylings['classes']['collectiveIndexing'] = bool
            }
          }

          else if (attributeName === 'clssrsi' || attributeName === 'classesRandomStartIndex') {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true' || value === 'yes'
              ? true
              : value === 'false' || value === 'no'
              ? false
              : null

            if (typeof bool === 'boolean') {
              sd.stylings['classes']['randomStartIndex'] = bool
            }
          }

          else if (attributeName === 'dp' || attributeName === 'display') {
            sd.stylings['display'] = attributeValue
          }
        })
    })

  return styleDefinitions
}

function processStyleApplications(originalStructure, styleDefinitions, namedSets) {
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

  originalStructure
    .flat()
    .map(v => [...v, v[2].match(applyRegex)])
    .filter(v => v[3])
    .forEach(v => {

      const [
        _,
        stylingName,
        absolutePos,
        absolutePosFromEnd,
        relativePos,
        otherNamedSet,
        otherNamedSetPos,
      ] = v[3]

      if (styleDefinitions.find(v => v.name === stylingName)) {
        const correspondingSets = getCorrespondingSets(
          originalStructure,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        )

        correspondingSets
          .forEach(set => styleApplications[set] = stylingName)
      }
    })

  return styleApplications
}

function processStyleRules(originalStructure, styleDefinitions) {
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
  originalStructure
    .flat()
    .map(v => [...v, v[2].match(ruleRegex)])
    .filter(v => v[3])
    .forEach(v => {

      const [
        _,
        stylingName,
        valueSetName,
        valueSetSetIndex,
        valueSetSetStar,
        valueSetValueIndex,
        valueSetValueStar,
      ] = v[3]

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
