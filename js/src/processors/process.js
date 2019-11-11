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
  orderPattern,
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
  const markedForDeletion = []
  const evaluators = []
  const valueSets = {}
  const yanks = []

  const namedSetStatements = []
  const orderStatements = []
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

    if (!content.startsWith('$')) {
      return [[iterNameSub, setIndex, elemIndex, content, mode]]
    }

    else if (content === '$meta()' || content === '$inject()') {
      markedForDeletion.push(setIndex)
    }

    ////// GENERATION
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
      evaluators.unshift([
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
      yanks.push([yanks.length, ...preprocessYank(patternResult.slice(1))])
    }

    ////// RANDOMIZATION
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

    else if (patternResult = content.match(orderPattern)) {
      orderStatements.push([
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

    ////// STYLING
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

    // calling invalid / nongenerator function element
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
    let result = null

    if (isSRToken(content)) {
      const pg = pm.pregenChecker(iterNameSub, setIndex, elemIndex)

      const [
        tokenName,
        ...tokens
      ] = fromSRToken(content, false)

      switch (tokenName) {
        case 'value':
          // don't need anymore evaluation
          break

        case 'pick:number':
          result = pg.expandPickNumber(
            preprocessAmount(tokens.slice(0, 1)),
            preprocessPickNumber(tokens.slice(1, 4)),
            preprocessUniq([null, tokens[4]]),
          )
          break

        case 'pick:vs':
          result = pg.expandPickValueSet(
            preprocessAmount(tokens.slice(0, 1)),
            preprocessVs(tokens.slice(1, 4)),
            preprocessUniq([null, tokens[4]]),
            valueSets,
          )
          break

        case 'vs': default:
          result = pg.expandValueSet(...tokens, valueSets, evaluators)
          break
      }
    }

    return mode === 'd' /* deleted */
      ? []
      : result
      ? result
      : [[iterName, setIndex, elemIndex, content, mode]]
  }

  const elementsProcessed = elements
    .map(set => set.flatMap(elem => processElem(...elem)))
    .map(set => set.flatMap(elem => expandGenerators(...elem)))
    .filter((_, idx) => !markedForDeletion.includes(idx))

  const forLateEvaluation = [
    namedSetStatements,
    orderStatements,
    commandStatements,
    styleStatements,
    applyStatements,
  ]

  return [
    elementsProcessed,
    yanks,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    valueSets,
    forLateEvaluation,
  ]
}

export default process
