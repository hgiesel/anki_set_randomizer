import {
  vsStar, vsSelf,
  uniqSome, uniqCond,
  amountStar,

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

export const getUniqProcessor = function(uniqConstraints) {
  const commit = function(validator) {
    for (const key in validator.preUcs) {
      for (const item of validator.preUcs[key]) {
        getUc(uniqConstraints, key).values.push(item)
      }
    }
  }

  const init = function(uc) {
    const preUcs = {}

    const processUniqSome = function(currentValue) {
      const uniqSet = getUc(uniqConstraints, uc.name)
        .values
        .concat(preUcs[uc.name] || [])

      if (!uniqSet.includes(currentValue)) {
        preUcs[uc.name]
          ? preUcs[uc.name].push(currentValue)
          : preUcs[uc.name] = [currentValue]
        return true
      }

      else {
        return false
      }
    }

    const processUniqCond = function(currentValue) {
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

    return {
      check: uc.type === uniqCond
        ? processUniqCond
        : uc.type === uniqSome
        ? processUniqSome
        : /* uniqNone */ () => true,
      preUcs: preUcs,
    }
  }

  return {
    init: init,
    commit: commit,
  }
}

export const generate = function(generator, validator, amount) {
  const values = []

  for (const value of generator) {
    const stop = amount.type !== amountStar && values.length === amount.value

    if (stop) {
      generator.return()
    }

    else if (validator.check(value)) {
      values.push(value)
    }
  }

  return {
    values: values,
    sufficient: /* for eval */ amount.type === amountStar || values.length === amount.value
  }
}
