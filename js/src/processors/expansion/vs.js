import {
  elem, uniq, vs, tag,
} from '../../types.js'

import {
  generate,
  getUniqProcessor,
} from './util.js'

const getAllVsValues = function(valueSets, vsVal) {
  const vsNames = vsVal.name === vs.star
    ? Object.keys(valueSets)
    : valueSets.hasOwnProperty(vsVal.name) ? [vsVal.name] : []

  const result = []

  for (const vsName of vsNames) {
    if (vs.sub === vs.star) {
      for (const [subIdx, sub] of valueSets[vsName].entries()) {
        if (vs.pos === vs.star) {
          for (const [posIdx /*, value */] of sub.values.entries()) {
            result.push(tag(elem.value, {
              name: vsName,
              sub: subIdx,
              pos: posIdx,
            }))
          }
        }

        else if (typeof sub.values[vs.pos] === 'string') {
          result.push(tag(elem.value, {
            name: vsName,
            sub: subIdx,
            pos: vs.pos,
          }))
        }
      }
    }

    else if (valueSets[vsName][vs.sub]) {
      if (vs.pos === vs.star) {
        for (const [posIdx /*, value */] of valueSets[vsName][vs.sub].values.entries()) {
          result.push(tag(elem.value, {
            name: vsName,
            sub: vs.sub,
            pos: posIdx,
          }))
        }
      }

      else if (typeof valueSets[vsName][vs.sub].values[vs.pos] === 'string') {
        result.push(tag(elem.value, {
          name: vsName,
          sub: vs.sub,
          pos: vs.pos,
        }))
      }
    }
  }

  return result
}

const valueGenerator = function*(valueSets, vsVal, presetValues, filter = false) {
  const searchDomain = presetValues
    ? [...presetValues]
    : getAllVsValues(valueSets, vsVal)

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
  valueMemory, amount, vsVal, uc,
) {
  const uniqProc = getUniqProcessor(uniqConstraints)

  const generator = valueGenerator(
    valueSets,
    vsVal,
    valueMemory.get(),
    uc.type === uniq.some || (uc.type === uniq.cond && uc.name),
  )
  const validator = uniqProc.init(uc, valueMemory.exists())

  const values = generate(generator, validator, amount)
  uniqProc.commit(validator)
  valueMemory.set(values.values)

  return values.values
}

export const expandValueSet = function(
  uniqConstraints, valueSets, evaluators,
  valueMemory, name, sub,
) {
  let firstLookup = null
  const foundEvaluators = evaluators.filter(([/* amount */, evalVs /*, uc */]) => (
    (evalVs.name === vs.star || evalVs.name === name) && (evalVs.sub === vs.star || evalVs.sub === sub)
  ))

  const uniqProc = getUniqProcessor(uniqConstraints)

  for (const [amount, evalVs, uc] of foundEvaluators) {
    const foundEval = [amount, evalVs, uc]
    const generator = valueGenerator(
      valueSets, {
        name: name,
        sub: sub,
        pos: evalVs.pos,
      },
      valueMemory.get(foundEval),
      uc.type === uniq.some || (uc.type === uniq.cond && Boolean(uc.name)),
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
