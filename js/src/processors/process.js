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
  processValueSet,
  processPick,
} from './numbered.js'

import {
  preprocessYank,
  preprocessName,
  preprocessVs,
  preprocessAmount,
  preprocessPick,
  preprocessUniq,
} from './preprocess.js'

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
  const occlusions = []

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
    let patternResult = null

    if (!content.startsWith('$') && mode === 'n') {
      return [[iterNameSub, setIndex, elemIndex, content, mode]]
    }

    ////// PROCESSING
    else if (patternResult = content.match(valueSetPattern)) {
      const vsToken = processValueSet(
        valueSets,
        iterNameSub,
        setIndex,
        elemIndex,
        ...patternResult.slice(1),
      )
      return [[iterNameSub, setIndex, elemIndex, vsToken, mode]]
    }

    else if (patternResult = content.match(evalPattern)) {
      evaluators.push(
        preprocessAmount(patternResult.slice(1, 2), 1),
        preprocessVs(patternResult.slice(2, 5)),
        preprocessUniq(patternResult.slice(5, 6)),
      )
    }

    else if (patternResult = content.match(pickPattern)) {
      console.log(patternResult)
      const pickToken = processPick(
        preprocessAmount(patternResult.slice(1, 2)),
        preprocessPick(patternResult.slice(2, 8)),
        preprocessUniq(patternResult.slice(8, 9)),
      )

      return [[iterNameSub, setIndex, elemIndex, pickToken, mode]]
    }

    else if (patternResult = content.match(yankPattern)) {
      occlusions.push(preprocessYank(patternResult.slice(1)))
    }

    ////// LATE EVALUATION
    else if (patternResult = content.match(namedSetPattern)) {
      namedSetStatements.push([iterNameSub, setIndex, elemIndex, ...patternResult.slice(1)])
    }

    else if (patternResult = content.match(commandPattern)) {
      commandStatements.push([iterNameSub, setIndex, elemIndex, ...patternResult.slice(1)])
    }

    else if (patternResult = content.match(stylePattern)) {
      console.log('style', patternResult)
      styleStatements.push([iterNameSub, setIndex, elemIndex, ...patternResult.slice(1)])
    }

    else if (patternResult = content.match(applyPattern)) {
      console.log('apply', patternResult)
      console.log(preprocessName(patternResult.slice(7, 11)))
      applyStatements.push([iterNameSub, setIndex, elemIndex, ...patternResult.slice(1)])
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
    occlusions,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    valueSets,
    forLateEvaluation,
  ]
}

export default process
