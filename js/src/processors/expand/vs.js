import {
  vsStar,
  uniqSome, uniqCond,
  toSRToken,
} from '../../util.js'

import {
  generate,
  getUniqProcessor,
} from './util.js'

const getAllVsValues = function(valueSets, vs) {
  const vsNames = vs.name === vsStar
    ? Object.keys(valueSets)
    : valueSets.hasOwnProperty(vs.name) ? [vs.name] : []

  const result = []

  for (const vsName of vsNames) {
    if (vs.sub === vsStar) {
      for (const [subIdx, sub] of valueSets[vsName].entries()) {
        if (vs.pos === vsStar) {
          for (const [posIdx /*, value */] of sub.values.entries()) {
            result.push(toSRToken(['value', vsName, subIdx, posIdx]))
          }
        }

        else if (typeof sub.values[vs.pos] === 'string') {
          result.push(toSRToken(['value', vsName, subIdx, vs.pos]))
        }
      }
    }

    else if (valueSets[vsName][vs.sub]) {
      if (vs.pos === vsStar) {
        for (const [posIdx /*, value */] of valueSets[vsName][vs.sub].values.entries()) {
          result.push(toSRToken(['value', vsName, vs.sub, posIdx]))
        }
      }

      else if (typeof valueSets[vsName][vs.sub].values[vs.pos] === 'string') {
        result.push(toSRToken(['value', vsName, vs.sub, vs.pos]))
      }
    }
  }

  return result
}

const valueGenerator = function*(valueSets, vs, presetValues, filter = false) {
  const searchDomain = presetValues
    ? [...presetValues]
    : getAllVsValues(valueSets, vs)

  if (presetValues) {
    filter = true
  }

  const maxTries = 100
  let tries = 0

  while (searchDomain.length > 0 && tries < maxTries) {
    const index = presetValues
      ? 0
      : /* random */ Math.floor(Math.random() * searchDomain.length)

    if (filter) {
      // removes value from search domain
      yield searchDomain.splice(index, 1)[0]
    }
    else {
      yield searchDomain[index]
    }

    tries++
  }
}

export const expandPickValueSet = function(
  uniqConstraints, valueSets,
  valueMemory, amount, vs, uc,
) {
  const uniqProc = getUniqProcessor(uniqConstraints)

  const generator = valueGenerator(
    valueSets,
    vs,
    valueMemory.get(),
    uc.type === uniqSome || (uc.type === uniqCond && uc.name),
  )
  const validator = uniqProc.init(uc, valueMemory.exists())

  const values = generate(generator, validator, amount)
  uniqProc.commit(validator)
  valueMemory.set(values.values)

  return values.values
}

export const expandValueSet = function(
  uniqConstraints, valueSets, evaluators,
  valueMemory, vsName, vsSub,
) {
  let firstLookup = null
  const foundEvaluators = evaluators.filter(([/* amount */, evalVs /*, uc */]) => (
    (evalVs.name === vsStar || evalVs.name === vsName) && (evalVs.sub === vsStar || evalVs.sub === vsSub)
  ))

  const uniqProc = getUniqProcessor(uniqConstraints)

  for (const [amount, evalVs, uc] of foundEvaluators) {
    const foundEval = [amount, evalVs, uc]
    const generator = valueGenerator(
      valueSets, {
        name: vsName,
        sub: vsSub,
        pos: evalVs.pos,
      },
      valueMemory.get(foundEval),
      uc.type === uniqSome || (uc.type === uniqCond && Boolean(uc.name)),
    )
    const validator = uniqProc.init(uc, valueMemory.exists(foundEval))

    const values = generate(generator, validator, amount)

    if (values.sufficient) {
      // return with sufficient lookup
      valueMemory.set(values.values, foundEval)
      uniqProc.commit(validator)
      return values.values
    }

    else if (!firstLookup) {
      firstLookup = {
        validator: validator,
        values: values.values,
        evaluator: foundEval,
      }
    }
  }

  if (firstLookup) {
    // return with unsufficient lookup
    uniqProc.commit(firstLookup.validator)
    valueMemory.set(firstLookup.values, firstLookup.evaluator)
    return firstLookup.values
  }

  return [/* return with no lookup */]
}
