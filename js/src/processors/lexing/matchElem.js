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

import {
  kwargs,
} from './kwargs.js'

import {
  processValueSet,
  processPick,
} from './numbered.js'

import {
  preprocessYank,
  preprocessNamepos,
  preprocessRule,
  preprocessPick,
  preprocessForce,
  preprocessVs,
  preprocessAmount,
  preprocessUniq,
} from './preprocess.js'

import {
  tag, elem,
} from '../types.js'

export const elementMatcher = function(styleSetter) {
  const valueSets = {}
  const evaluators = []
  const yanks = []
  const markedForDeletion = []

  const nameTokens = []
  const orderTokens = []
  const applyTokens = []
  const commandTokens = []

  const match = function([
    iterName,
    setIndex,
    elemIndex,
    content,
    mode,
  ]) {
    let patternResult = null

    if (!content.startsWith('$')) {
      return [[iterName, setIndex, elemIndex, tag(elem.text, content), mode]]
    }

    else if (content === '$meta()' || content === '$inject()') {
      markedForDeletion.push(setIndex)
    }

    ////// GENERATION
    else if (patternResult = content.match(valueSetPattern)) {
      const elemVs = processValueSet(
        valueSets,
        iterName,
        setIndex,
        elemIndex,
        ...patternResult.slice(1),
      )

      return [[iterName, setIndex, elemIndex, elemVs, mode]]
    }

    else if (patternResult = content.match(evalPattern)) {
      evaluators.unshift([
        preprocessAmount(patternResult[1], 1),
        preprocessVs(patternResult.slice(2, 5), true),
        preprocessUniq(kwargs(patternResult[5])),
      ])
    }

    else if (patternResult = content.match(pickPattern)) {
      const elemPick = processPick(
        preprocessAmount(patternResult[1]),
        preprocessPick(patternResult.slice(2, 8)),
        preprocessUniq(kwargs(patternResult[8]), true),
      )

      return [[iterName, setIndex, elemIndex, elemPick, mode]]
    }

    else if (patternResult = content.match(yankPattern)) {
      yanks.push([yanks.length, ...preprocessYank(patternResult.slice(1))])
    }

    ////// STYLING
    else if (patternResult = content.match(stylePattern)) {
      styleSetter.setAttributes(patternResult[1], kwargs(patternResult[2]))
    }

    ////// LATE EVALUATION
    else if (patternResult = content.match(namedSetPattern)) {
      nameTokens.push([
        iterName,
        setIndex,
        elemIndex,
        preprocessRule(patternResult.slice(1, 5), true),
        patternResult[5] /* name */,
        preprocessNamepos(patternResult.slice(6, 13)),
        preprocessForce(kwargs(patternResult[13])),
      ])
    }

    else if (patternResult = content.match(orderPattern)) {
      orderTokens.push([
        iterName,
        setIndex,
        elemIndex,
        preprocessRule(patternResult.slice(1, 5), true),
        patternResult[5] /* name */,
        preprocessNamepos(patternResult.slice(6, 13)),
        preprocessForce(kwargs(patternResult[13])),
      ])
    }

    else if (patternResult = content.match(commandPattern)) {
      commandTokens.push([
        iterName,
        setIndex,
        elemIndex,
        ...patternResult.slice(1),
      ])
    }

    else if (patternResult = content.match(applyPattern)) {
      applyTokens.push([
        iterName,
        setIndex,
        elemIndex,
        preprocessRule(patternResult.slice(1, 5), true),
        patternResult[5] /* style name */,
        preprocessNamepos(patternResult.slice(6, 13)),
      ])
    }

    // calling invalid / nongenerator function element
    return []
  }

  const exportValueSets = () => valueSets
  const exportEvaluators = () => evaluators
  const exportTokens = () => [
    nameTokens,
    orderTokens,
    commandTokens,
    applyTokens
  ]
  const exportMarkedForDeletion = () => markedForDeletion
  const exportYanks = () => yanks

  return {
    match: match,

    exportValueSets: exportValueSets,
    exportEvaluators: exportEvaluators,
    exportTokens: exportTokens,
    exportMarkedForDeletion: exportMarkedForDeletion,
    exportYanks: exportYanks,
  }
}

export default elementMatcher
