import {
  uniqSome,
  pickInt,
} from '../util.js'

import {
  getUniqProcessor,
  generate,
} from './expand.js'

const intGenerator = function*(min, max, extra, filter = false) {
  const searchDomain = [...Array(max - min + 1).keys()]
    .map(v => v + min)
    .map(v => v * extra)
    .map(String)

  const maxTries = 100
  let tries = 0

  while (searchDomain.length > 0 && tries < maxTries) {
    const randomIndex = Math.floor(Math.random() * searchDomain.length)

    if (filter) {
      // removes value from search domain
      yield searchDomain.splice(randomIndex, 1)[0]
    }
    else {
      yield searchDomain[randomIndex]
    }

    tries++
  }
}

const realGenerator = function*(min, max, extra) {
  const maxTries = 100
  let tries = 0

  while (tries < maxTries) {
    const value = Math.random() * (max - min) + min
    const stringValue = value.toFixed(extra)

    yield stringValue

    tries++
  }
}

export const expandPickNumber = function(
  uniqConstraints,
  amount, pick, uc,
) {
  const uniqProc = getUniqProcessor(uniqConstraints)

  const generator = pick.type === pickInt
    ? intGenerator(pick.min, pick.max, pick.extra, uc.type === uniqSome)
    : realGenerator(pick.min, pick.max, pick.extra)
  const validator = uniqProc.init(uc)

  const values = generate(generator, validator, amount)

  uniqProc.commit(validator)
  return values.values
}
