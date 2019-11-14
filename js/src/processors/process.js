import {
  fromSRToken,
  isSRToken,
} from '../util.js'

import styleSetter from './styleSetter.js'

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
  preprocessForce,
} from './preprocess.js'

import {
  pregenManager,
} from './pregen.js'

import {
  kwargs,
} from './kwargs.js'

export const process = function(
  elements,
  generatedValues,
  uniqConstraints,
  defaultStyle,
  iterName,
) {
  const markedForDeletion = []
  const ss = styleSetter(defaultStyle)
  const evaluators = []
  const valueSets = {}
  const yanks = []

  const namedSetStatements = []
  const orderStatements = []
  const commandStatements = []
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
        preprocessAmount(patternResult[1], 1),
        preprocessVs(patternResult.slice(2, 5), true),
        preprocessUniq(kwargs(patternResult[5]), true),
      ])
    }

    else if (patternResult = content.match(pickPattern)) {
      const pickToken = processPick(
        preprocessAmount(patternResult[1]),
        preprocessPick(patternResult.slice(2, 8)),
        preprocessUniq(kwargs(patternResult[8]), true),
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
        preprocessVs(patternResult.slice(1, 4), true),
        patternResult[4] /* name */,
        preprocessNamepos(patternResult.slice(5, 9)),
        preprocessForce(kwargs(patternResult[9])),
      ])
    }

    else if (patternResult = content.match(orderPattern)) {
      orderStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        preprocessVs(patternResult.slice(1, 4), true),
        patternResult[4] /* name */,
        preprocessNamepos(patternResult.slice(5, 9)),
        preprocessForce(kwargs(patternResult[9])),
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
      ss.setAttributes(patternResult[1], kwargs(patternResult[2]))
    }

    else if (patternResult = content.match(applyPattern)) {
      applyStatements.push([
        iterNameSub,
        setIndex,
        elemIndex,
        preprocessVs(patternResult.slice(1, 4), true),
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
            preprocessAmount(tokens[0]),
            preprocessPickNumber(tokens.slice(1, 4)),
            preprocessUniq(kwargs(tokens[4]))
          )
          break

        case 'pick:vs':
          result = pg.expandPickValueSet(
            preprocessAmount(tokens[0]),
            preprocessVs(tokens.slice(1, 4)),
            preprocessUniq(kwargs(tokens[4])),
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
    applyStatements,
  ]

  return [
    elementsProcessed,
    yanks,
    valueSets,
    pm.exportGeneratedValues(),
    pm.exportUniqConstraints(),
    ss.exportStyleDefinitions(),
    forLateEvaluation,
  ]
}

export default process
