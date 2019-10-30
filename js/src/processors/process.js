import {
  fromSRToken,
  isSRToken,
} from '../util.js'

import {
  valueSetPattern,
  evalPattern,
  pickPattern,
  yankPattern,

  namedSetPattern,
  commandPattern,
  stylePattern,
  applyPattern,
} from './util.js'

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

export const process = function(
  elements,
  generatedValues,
  uniqConstraints,
  iterName,
) {
  const evaluators = []
  const valueSets = {}
  const yanks = []

  const namedSetStatements = []
  const commandStatements = []
  const styleStatements = []
  const applyStatements = []

  const processElem = function(
    iterNameSub,
    setIndex,
    elemIndex,
    content,
    mode,
  ) {
    let match = null

    if (!content.startsWith('$') && mode === 'n') {
      return [[iterNameSub, setIndex, elemIndex, content, mode]]
    }

    ////// PROCESSING
    else if (match = content.match(valueSetPattern)) {
      const vsToken = processValueSet(
        valueSets,
        iterNameSub,
        setIndex,
        elemIndex,
        ...match.slice(1),
      )
      return [[iterNameSub, setIndex, elemIndex, vsToken, mode]]
    }

    else if (match = content.match(evalPattern)) {
      evaluators.push(processEvaluator(...match.slice(1)))
    }

    else if (match = content.match(pickPattern)) {
      const pickToken = processPick(...match.slice(1))
      return [[iterNameSub, setIndex, elemIndex, pickToken, mode]]
    }

    else if (match = content.match(yankPattern)) {
      yanks.push(processYank(...match.slice(1)))
    }

    ////// LATE EVALUATION
    else if (match = content.match(namedSetPattern)) {
      namedSetStatements.push([iterNameSub, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(commandPattern)) {
      commandStatements.push([iterNameSub, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(stylePattern)) {
      styleStatements.push([iterNameSub, setIndex, elemIndex, ...match.slice(1)])
    }

    else if (match = content.match(applyPattern)) {
      applyStatements.push([iterNameSub, setIndex, elemIndex, ...match.slice(1)])
    }

    return []
  }

  const pm = pregenManager(generatedValues, uniqConstraints)

  const expandGenerators = function(
    iterNameSub,
    setIndex,
    elemIndex,
    content,
    mode,
  ) {
    if (isSRToken(content)) {
      const tokens = fromSRToken(content)
      const pg = pm.pregenChecker(iterNameSub, setIndex, elemIndex)

      switch (tokens[0]) {
        case 'pick:number':
          return pg.evalPickNumber(...tokens.slice(1))

        case 'pick:vs':
          return pg.evalPickValueSet(valueSets, ...tokens.slice(1))

        case 'vs':
          return pg.evalValueSet(valueSets, evaluators, ...tokens.slice(1))

        default:
          // should never occur
          return ''
      }
    }

    return [[iterName, setIndex, elemIndex, content, mode]]
  }

  const numberedSets = elements
    .map(set => set.flatMap(elem => processElem(...elem)))
    .map((set, i) => ({
      'iter': iterName,
      'name': i,
      'sets': [i],
      'elements': set
        .flatMap(elem => expandGenerators(...elem)),
    }))

  const forLateEvaluation = [
    namedSetStatements,
    commandStatements,
    styleStatements,
    applyStatements,
  ]

  return [
    numberedSets,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    valueSets,
    forLateEvaluation,
  ]
}

export default process
