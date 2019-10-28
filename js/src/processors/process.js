import {
  namePattern,
  positionPattern,
} from './util.js'

import {
  toSRToken,
  fromSRToken,
  isSRToken,
} from '../util.js'

import {
  processEvaluator,
  processValueSet,
  processPick,
} from './numbered.js'

import {
  pregenManager,
} from './pregen.js'

const evaluatorPattern = new RegExp(
  `^\\$(?:evaluate|eval|e)\\(` +
  `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
  `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
  `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
)

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

export function process(elements, generatedValues, uniqConstraints, iterName) {

  const evaluators = []
  const valueSets = {}

  const processElem = function(iterName, setIndex, elemIndex, content, mode) {

    let match

    if (!content.startsWith('$') && mode === 'n') {
      return [[iterName, setIndex, elemIndex, content, mode]]
    }

    else if (match = content.match(evaluatorPattern)) {
      evaluators.push(processEvaluator(...match.slice(1)))
    }

    else if (match = content.match(valueSetPattern)) {
      const [
        valueSetName,
        valueSetIndex,
      ] = processValueSet(valueSets, iterName, setIndex, elemIndex, ...match.slice(1))

      const vsToken = toSRToken(['vs', valueSetName, valueSetIndex])
      return [[iterName, setIndex, elemIndex, vsToken, mode]]
    }

    else if (match = content.match(pickPattern)) {
      const pickToken = processPick(...match.slice(1))
      return [[iterName, setIndex, elemIndex, pickToken, mode]]
    }

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

  const result = elements
    .map(set => set.flatMap(elem => processElem(...elem)))
    .map(v => (console.log(v),v))
    .map((set, i) => ({
      "iter": iterName,
      "name": i,
      "elements": set
        .flatMap(elem => expandGenerators(...elem))
    }))

  return [
    result,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    valueSets
  ]
}
