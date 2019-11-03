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
  preprocessNamepos,
  preprocessVs,
  preprocessAmount,
  preprocessPick,
  preprocessPickNumber,
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
      evaluators.push([
        preprocessAmount(patternResult.slice(1, 2), 1),
        preprocessVs(patternResult.slice(2, 5)),
        preprocessUniq(patternResult.slice(5, 7)),
      ])
    }

    else if (patternResult = content.match(pickPattern)) {
      const pickToken = processPick(
        preprocessAmount(patternResult.slice(1, 2)),
        preprocessPick(patternResult.slice(2, 8)),
        preprocessUniq(patternResult.slice(8, 10)),
      )

      return [[iterNameSub, setIndex, elemIndex, pickToken, mode]]
    }

    else if (patternResult = content.match(yankPattern)) {
      occlusions.push(preprocessYank(patternResult.slice(1)))
    }

    ////// LATE EVALUATION
    else if (patternResult = content.match(namedSetPattern)) {
      namedSetStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        preprocessVs(patternResult.slice(1, 4)),
        patternResult[4] /* name */,
        preprocessNamepos(patternResult.slice(5, 9)),
        patternResult.slice(9) /* keywords */,
      ])
    }

    else if (patternResult = content.match(commandPattern)) {
      commandStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        ...patternResult.slice(1),
      ])
    }

    else if (patternResult = content.match(stylePattern)) {
      styleStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        ...patternResult.slice(1),
      ])
    }

    else if (patternResult = content.match(applyPattern)) {
      applyStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        preprocessVs(patternResult.slice(1, 4)),
        patternResult[4] /* style name */,
        preprocessNamepos(patternResult.slice(5)),
      ])
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
      const pg = pm.pregenChecker(iterNameSub, setIndex, elemIndex)

      const [
        tokenName,
        ...tokens
      ] = fromSRToken(content, false)

      switch (tokenName) {
        case 'pick:number':
          const a = pg.expandPickNumber(
            preprocessAmount(tokens.slice(0, 1)),
            preprocessPickNumber(tokens.slice(1, 4)),
            preprocessUniq([null, tokens[4]]),
          )
          return a

        case 'pick:vs':
          return pg.expandPickValueSet(
            valueSets,
            preprocessAmount(tokens.slice(0, 1)),
            preprocessVs(tokens.slice(1, 4)),
            preprocessUniq([null, tokens[5]]),
          )

        case 'vs':
          return pg.expandValueSet(valueSets, evaluators, ...tokens)

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

  console.log('nss', namedSetStatements)

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
