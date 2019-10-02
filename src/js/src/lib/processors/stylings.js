import {
  namePattern,
  getCorrespondingSets,
} from './util.js'

export function processRenderDirectives(originalStructure, defaultStyle, namedSets) {
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

  const afterColonRegex = new RegExp(':(.*)$')

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
          stylings: {}
        })

        sd = styleDefinitions[idx - 1]
      }

      stylingDirectives
        .split(',')
        .map(v => v.trim())
        .forEach(v => {

          if (v.startsWith('od:') || v.startsWith('openDelim:')) {
            sd.stylings['openDelim'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('cd:') || v.startsWith('closeDelim:')) {
            sd.stylings['closeDelim'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('fs:') || v.startsWith('fieldSeparator:')) {
            sd.stylings['fieldSeparator'] = v.match(afterColonRegex)[1]
          }
          else if (v.startsWith('fp:') || v.startsWith('fieldPadding:')) {
            const value = Number(v.match(afterColonRegex)[1])
            if (value >= 0) {
              sd.stylings['fieldPadding'] = value
            }
          }

          else if (v.startsWith('clrs:') || v.startsWith('colors:')) {
            sd.stylings['colors'] = v.match(afterColonRegex)[1].split(':')
          }
          else if (v.startsWith('clss:') || v.startsWith('classes:')) {
            sd.stylings['classes'] = v.match(afterColonRegex)[1].split(':')
          }

          else if (v.startsWith('rclrs:') || v.startsWith('ruleColors:')) {
            sd.stylings['ruleColors'] = v.match(afterColonRegex)[1].split(':')
          }
          else if (v.startsWith('rclss:') || v.startsWith('ruleClasses:')) {
            sd.stylings['ruleClasses'] = v.match(afterColonRegex)[1].split(':')
          }

          else if (v.startsWith('ci:') || v.startsWith('collectiveIndexing:')) {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true'
              ? true
              : value === 'false'
                ? false
                : null

            if (typeof bool === 'boolean') {
              sd.stylings['collectiveIndexing'] = bool
            }
          }
          else if (v.startsWith('rsi:') || v.startsWith('randomStartIndex:')) {
            const value = v.match(afterColonRegex)[1]
            const bool = value === 'true'
              ? true
              : value === 'false'
                ? false
                : null

            if (typeof bool === 'boolean') {
              sd.stylings['randomStartIndex'] = bool
            }
          }

          else if (v.startsWith('dp:') || v.startsWith('display:')) {
            sd.stylings['display'] = v.match(afterColonRegex)[1]
          }
        })
    })

  const styleApplications = []
  const styleRules = []

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

  const ruleRegex = new RegExp(
    `^\\$(?:rule|r)\\(` +
    `(${namePattern})` +
    `(?:\\s*,\\s` +
    `(?:` + // second arg
    `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
    `(${namePattern})(?::(\\d+|n?-\\d+))?` + // named set arg
    `)` +
    `)?` +
    `\\)$`
  )

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

  return [styleDefinitions, styleApplications, styleRules]
}
