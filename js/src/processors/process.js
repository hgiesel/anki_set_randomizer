import {
  namePattern,
  positionPattern,
} from './util.js'

import {
  toSRToken,
  fromSRToken,
  isSRToken,
} from '../util.js'

////

import {
  processEvaluator,
  processValueSet,
  processPick,
} from './numbered.js'

import {
  processYank,
} from './yanks.js'

import {
  pregenManager,
} from './pregen.js'

const valueSetPattern = new RegExp(
  `^\\$(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
)

const intPattern       = '\\d+'
const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
const realIntGenerator =
  `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`

const pickPattern = new RegExp(
  `^\\$(?:pick|p)\\(` +
  `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
  `(?:${realIntGenerator}|` +
  `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)?)` + // picking from value sets
  `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
)

const evaluatorPattern = new RegExp(
  `^\\$(?:evaluate|eval|e)\\(` +
  `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
  `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
  `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
)

const yankPattern = new RegExp(
  `^\\$(?:yank|y)\\(` +
  // `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
  // `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
  `\\)`
)

/////

const namedSetPattern = new RegExp(
  `\\$(?:name|n)(!)?` +
  `\\(` +
  `(${namePattern})` +
  `(?:` +
  `\\s*,\\s*` +
  `(?:` + // second arg
  `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
  `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
  `)` +
  `)?` +
  `\\)$`
)

const idxRegex      = `(?:(\\d+)|((?:\\+|-)\\d+)|n(-\\d+)|(${namePattern}))`
const positionRegex = ':(?:\\+?(\\d+)|n?(-\\d+))'

const commandPattern = new RegExp(
  `^\\$(?:(c|copy)|(m|move)|(d|del|delete))\\(` +
  `(?:` +
  `(\\d+)` + // amount
  `(?:` +
  `\\s*,\\s*` +
  `${idxRegex}(?:${positionRegex})?` + // fromPosition
  `(?:` +
  `\\s*,\\s*` +
  `${idxRegex}(?:${positionRegex})?` + // toPosition
  `)?` +
  `)?` +
  `)?\\)$`
)

//////// STYLING REGEXES
const stylePattern = new RegExp(
  `^\\$(?:style|s)\\(` +
  `(${namePattern})` +
  `\\s*,\\s` +
  `(.*)` + // styling directives
  `\\)$`
)

const applyPattern = new RegExp(
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

const rulePattern = new RegExp(
  `^\\$(?:rule|r)\\(` +
  `(${namePattern})` +
  `(?:\\s*,\\s` +
  `(?:` + // second arg
  valueSetPattern +
  `)` +
  `)?` +
  `\\)$`
)

export default function process(elements, generatedValues, uniqConstraints, iterName) {

  const evaluators = []
  const valueSets  = {}
  const yanks      = []

  const namedSetStatements = []
  const commandStatements  = []
  const styleStatements    = []
  const applyStatements    = []

  const processElem = function(iterName, setIndex, elemIndex, content, mode) {

    let match

    if (!content.startsWith('$') && mode === 'n') {
      return [[iterName, setIndex, elemIndex, content, mode]]
    }

    else if (match = content.match(evaluatorPattern)) {
      evaluators.push(processEvaluator(...match.slice(1)))
    }

    else if (match = content.match(valueSetPattern)) {
      const vsToken = processValueSet(valueSets, iterName, setIndex, elemIndex, ...match.slice(1))
      return [[iterName, setIndex, elemIndex, vsToken, mode]]
    }

    else if (match = content.match(pickPattern)) {
      const pickToken = processPick(...match.slice(1))
      return [[iterName, setIndex, elemIndex, pickToken, mode]]
    }

    else if (match = content.match(yankPattern)) {
      yanks.push(processYank(...match.slice(1)))
    }

    ////// LATE EVALUATION
    else if (match = content.match(namedSetPattern)) {
      namedSetStatements.push([iterName, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(commandPattern)) {
      commandStatements.push([iterName, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(stylePattern)) {
      styleStatements.push([iterName, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(stylePattern)) {
      applyStatements.push([iterName, setIndex, elemIndex, ...match.slice(1)])
    }
    // else if (match = content.match(styleRulePattern)) {
    //   styleRuleStatements.push([iterName, setIndex, elemIndex, match])
    // }

    return []
  }

  const pm = pregenManager(generatedValues, uniqConstraints)

  const expandGenerators = function(iterName, setIndex, elemIndex, content, mode) {

    if (isSRToken(content)) {

      const tokens = fromSRToken(content)
      const pg = pm.pregenChecker(iterName, setIndex, elemIndex)

      switch (tokens[0]) {

        case 'pick:number':
          return pg.evalPickNumber(...tokens.slice(1))

        case 'pick:vs':
          return pg.evalPickValueSet(valueSets, ...tokens.slice(1))

        case 'vs':
          return pg.evalValueSet(valueSets, evaluators, ...tokens.slice(1))
      }
    }

    return [[iterName, setIndex, elemIndex, content, mode]]
  }

  const numberedSets = elements
    .map(set => set.flatMap(elem => processElem(...elem)))
    .map(v => (console.log(v),v))
    .map((set, i) => ({
      "iter": iterName,
      "name": i,
      "elements": set
        .flatMap(elem => expandGenerators(...elem))
    }))

  return [
    numberedSets,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    valueSets,
    [namedSetStatements, commandStatements, styleStatements, applyStatements],
  ]
}
