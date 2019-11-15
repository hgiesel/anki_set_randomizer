import {
  vsStar, vsSelf,
  pickInt, pickReal,
  uniqSome, uniqCond,
  amountStar,

  toSRToken,
  fromSRToken,
} from '../util.js'

import {
  vsRegex,
} from './util.js'

import {
  preprocessVs,
} from './preprocess.js'

//////////////////////////////////////////////////
// UNIQUENESS SETS AND CONSTRAINTS
const getUc = function(uniqConstraints, ucName) {
  return uniqConstraints.find(v => v.name === ucName)
    || uniqConstraints[uniqConstraints.push({ name: ucName, values: [] }) - 1]
}

const getUniqProcessor = function(uniqConstraints) {
  const commit = function(preUcs) {
    for (const key in preUcs) {
      for (const item in preUcs[key]) {
        getUc(uniqConstraints, key).values.push(item)
      }
    }
  }

  const init = function(uc) {
    const processUniqSome = function(currentValue, preUcs) {
      const uniqSet = getUc(uniqConstraints, uc.name)
        .values
        .concat(preUcs[uc.name] || [])

      if (!uniqSet.values.includes(currentValue)) {
        preUcs[uc.name]
          ? preUcs[uc.name].push(currentValue)
          : preUcs[uc.name] = [currentValue]
        return true
      }

      else {
        return false
      }
    }

    const processUniqCond = function(currentValue, preUcs) {
      const processUniqCondRecursive = function(condition) {
        switch (condition[0]) {
          case '&': case '&amp;':
            return condition
              .slice(1)
              .map(processUniqCondRecursive)
              .reduce((accu, v) => accu && v)

          case '|':
            return condition
              .slice(1)
              .map(processUniqCondRecursive)
              .reduce((accu, v) => accu || v)

          case '!':
            return !processUniqCondRecursive(condition[1])

          default:
            const uniqSet = getUc(uniqConstraints, condition[0])
              .values
              .concat(preUcs[condition[0]] || [])
            let vs = null
            let currentVs = null

            if (condition.length === 0) {
              return true
            }

            else {
              switch (condition[1]) {
                case 'includes':
                  vs = preprocessVs(condition[2].match(vsRegex).slice(1))
                  currentVs = preprocessVs(fromSRToken(currentValue, true))

                  return Boolean(uniqSet.find((usVs) => {
                    const usVsDeserialized = preprocessVs(fromSRToken(usVs, true))

                    return (vs.name === vsStar || (vs.name === vsSelf ? currentVs.name : vs.name) === usVsDeserialized.name)
                      && (vs.sub === vsStar || (vs.sub === vsSelf ? currentVs.sub : vs.sub) === usVsDeserialized.sub)
                      && (vs.pos === vsStar || (vs.pos === vsSelf ? currentVs.pos : vs.pos) === usVsDeserialized.pos)
                  }))

                case '!includes':
                  vs = preprocessVs(condition[2].match(vsRegex).slice(1))
                  currentVs = preprocessVs(fromSRToken(currentValue, true))

                  return !Boolean(uniqSet.find((usVs) => {
                    const usVsDeserialized = preprocessVs(fromSRToken(usVs, true))

                    return (vs.name === vsStar || (vs.name === vsSelf ? currentVs.name : vs.name) === usVsDeserialized.name)
                      && (vs.sub === vsStar || (vs.sub === vsSelf ? currentVs.sub : vs.sub) === usVsDeserialized.sub)
                      && (vs.pos === vsStar || (vs.pos === vsSelf ? currentVs.pos : vs.pos) === usVsDeserialized.pos)
                  }))

                case '<': case '&lt;':
                  return uniqSet.length < condition[2]

                case '<=': case '&lt;=':
                  return uniqSet.length <= condition[2]

                case 'eq':
                  return uniqSet.length === condition[2]

                case 'neq':
                  return uniqSet.length !== condition[2]

                case '>=': case '&gt;=':
                  return uniqSet.length >= condition[2]

                case '>': case '&gt;':
                  return uniqSet.length > condition[2]

                case '%':
                  return (uniqSet.length % condition[2]) === 0

                default:
                  return false
              }
            }
        }
      }

      let passes = null

      try {
        passes = processUniqCondRecursive(uc.cond)
      }
      catch (e) {
        console.error('Invalid Uniqueness Condition', e)
        return false
      }

      for (const name of (passes ? uc.add : uc.fail)) {
        preUcs[name]
          ? preUcs[name].push(currentValue)
          : preUcs[name] = [currentValue]
      }

      return passes
    }

    return uc.type === uniqCond
      ? processUniqCond
      : uc.type === uniqSome
      ? processUniqSome
      : /* uniqNone */ () => ({
        passes: true,
      })
  }

  return {
    init: init,
    commit: commit,
  }
}

//////////////////////////////////////////////////
// EXPAND NUMBER
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
  const resultValues = []
  const uniqProc = getUniqProcessor(uniqConstraints)
  const validate = uniqProc.init(uc)

  const preUcs = {}

  const generator = pick.type === pickInt
    ? intGenerator(pick.min, pick.max, pick.extra, uc.type === uniqSome)
    : realGenerator(pick.min, pick.max, pick.extra)

  while ((amount.type === amountStar && pick.type !== pickReal) || resultValues.length < amount.value) {
    const value = generator.next()

    if (value.done) {
      break
    }

    if (validate(value.value, preUcs)) {
      uniqProc.commit(preUcs)
      resultValues.push(value.value)
    }
  }

  return resultValues
}

//////////////////////////////////////////////////
// EXPAND VALUE SETS
const getAllVsValues = function(valueSets, vs) {
  const vsNames = vs.name === vsStar
    ? Object.keys(valueSets)
    : [vs.name]

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

const valueGenerator = function*(valueSets, vs, filter = false) {
  const searchDomain = getAllVsValues(valueSets, vs)

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

export const expandPickValueSet = function(
  uniqConstraints,
  amount, vs, uc,
  valueSets,
) {
  const resultValues = []

  const vsGen = valueGenerator(valueSets, vs, uc.type === uniqSome)

  const uniqProc = getUniqProcessor(uniqConstraints)
  const validate = uniqProc.init(uc)

  const preUcs = {}

  while (amount.type === amountStar || resultValues.length < amount.value) {
    const value = vsGen.next()

    if (value.done) {
      break
    }

    if (validate(value.value, preUcs)) {
      uniqProc.commit(preUcs)
      resultValues.push(value.value)
    }
  }

  return resultValues
}

export const expandValueSet = function(
  uniqConstraints,
  vsName, vsSub,
  valueSets, evaluators,
) {
  let resolvedValues = []
  let firstLookup = null

  const foundEvaluators = evaluators.filter(([/* amount */, evalVs /*, uc */]) => (
    (evalVs.name === vsStar || evalVs.name === vsName) && (evalVs.sub === vsStar || evalVs.sub === vsSub)
  ))

  const uniqProc = getUniqProcessor(uniqConstraints)

  for (const evaluator of foundEvaluators) {
    resolvedValues = [/* reset */]

    const [
      amount,
      evalVs,
      uc,
    ] = evaluator

    const validate = uniqProc.init(uc)
    const preUcs = {}

    const vsGen = valueGenerator(valueSets, {
      name: vsName,
      sub: vsSub,
      pos: evalVs.pos
    }, uc.type === uniqSome)

    while (amount.type === amountStar || resolvedValues.length < amount.value) {
      const value = vsGen.next()

      if (value.done) {
        break
      }

      if (validate(value.value, preUcs)) {
        resolvedValues.push(value.value)
      }
    }

    if (resolvedValues.length === amount.value /* sufficient lookup */) {
      // return with no or sufficient lookup
      uniqProc.commit(preUcs)
      return resolvedValues
    }

    if (!firstLookup) {
      firstLookup = {
        resolvedValues: resolvedValues,
        preUcs: preUcs,
      }
    }
  }

  // return with unsufficient lookup
  if (firstLookup) {
    uniqProc.commit(firstLookup.preUcs)
    return firstLookup.resolvedValues
  }

  // return with no lookup
  return resolvedValues
}
