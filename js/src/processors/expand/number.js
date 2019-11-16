import {
  uniqSome, uniqCond,
  pickInt,
} from '../../util.js'

import {
  getUniqProcessor,
  generate,
} from './util.js'

const intGenerator = function*(min, max, extra, presetValues, filter = false) {
  const searchDomain = presetValues
    ? [...presetValues]
    : [...Array(max - min + 1).keys()]
      .map(v => v + min)
      .map(v => v * extra)
      .map(String)

  const maxTries = 100
  let tries = 0

  if (presetValues) {
    filter = true
  }

  while (searchDomain.length > 0 && tries < maxTries) {
    const index = presetValues
      ? 0
      : Math.floor(Math.random() * searchDomain.length)

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

const realGenerator = function*(min, max, extra, presetValues) {
  const maxTries = 100
  let tries = 0

  const searchDomain = presetValues
    ? [...presetValues]
    : []

  while (tries < maxTries && (!presetValues || searchDomain.length > 0)) {
    const value = presetValues
      ? searchDomain.splice(0, 1)[0]
      : (Math.random() * (max - min) + min).toFixed(extra)

    yield value
    tries++
  }
}

export const expandPickNumber = function(
  uniqConstraints,
  valueMemory, amount, pick, uc,
) {
  const uniqProc = getUniqProcessor(uniqConstraints)

  const generator = pick.type === pickInt
    ? intGenerator(
      pick.min,
      pick.max,
      pick.extra,
      valueMemory.get(),
      uc.type === uniqSome || (uc.type === uniqCond && Boolean(uc.name)),
    )
    : realGenerator(
      pick.min,
      pick.max,
      pick.extra,
      valueMemory.get(),
    )
  const validator = uniqProc.init(uc, valueMemory.exists())

  const values = generate(generator, validator, amount)

  uniqProc.commit(validator)
  valueMemory.set(values.values)

  return values.values
}
