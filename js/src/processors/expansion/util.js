import {
  vs,
  uniq,
  amount,
  extract,
} from '../../types.js'

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

  const init = function(uc, valueMemory) {
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
            let vsVal = null
            let currentVs = null

            if (condition.length === 0) {
              return true
            }

            else {
              switch (condition[1]) {
                case 'includes':
                  vsVal = preprocessVs(condition[2].match(vsRegex).slice(1))
                  currentVs = preprocessVs(fromSRToken(currentValue, true))

                  return Boolean(uniqSet.find((usVs) => {
                    const usVsDeserialized = preprocessVs(fromSRToken(usVs, true))

                    return (vsVal.name === vs.star || (vsVal.name === vs.self ? currentVs.name : vsVal.name) === usVsDeserialized.name)
                      && (vsVal.sub === vs.star || (vsVal.sub === vs.self ? currentVs.sub : vsVal.sub) === usVsDeserialized.sub)
                      && (vsVal.pos === vs.star || (vsVal.pos === vs.self ? currentVs.pos : vsVal.pos) === usVsDeserialized.pos)
                  }))

                case '!includes':
                  vsVal = preprocessVs(condition[2].match(vsRegex).slice(1))
                  currentVs = preprocessVs(fromSRToken(currentValue, true))

                  return !Boolean(uniqSet.find((usVs) => {
                    const usVsDeserialized = preprocessVs(fromSRToken(usVs, true))

                    return (vsVal.name === vs.star || (vsVal.name === vs.self ? currentVs.name : vsVal.name) === usVsDeserialized.name)
                      && (vsVal.sub === vs.star || (vsVal.sub === vs.self ? currentVs.sub : vsVal.sub) === usVsDeserialized.sub)
                      && (vsVal.pos === vs.star || (vsVal.pos === vs.self ? currentVs.pos : vsVal.pos) === usVsDeserialized.pos)
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
        passes = processUniqCondRecursive(uc.name
          ? ['&', [uc.name, '!includes', '$$'], uc.cond]
          : uc.cond
        )
      }
      catch (e) {
        console.error('Invalid Uniqueness Condition', e)
        return false
      }

      for (const name of (passes ? (uc.name ? uc.add.concat(uc.name) : uc.add) : uc.fail)) {
        preUcs[name]
          ? preUcs[name].push(currentValue)
          : preUcs[name] = [currentValue]
      }

      return passes
    }

    return {
      check: valueMemory
        ? /* no validating necessary */ () => true
        : uc.type === uniq.cond
        ? processUniqCond
        : uc.type === uniq.some
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

const amountHandler = function(amountIn) {
  switch (amountIn.type) {
    case amount.count:
      const amountData = extract(amountIn)
      return {
        canStop: v => v === amountData.value,
        isSufficient: v => v === amountData.value,
      }

    case amount.star:
      return {
        canStop: () => false,
        isSufficient: () => true,
      }

    case amount.plus:
      return {
        canStop: () => false,
        isSufficient: v => v >= 1,
      }

    case amount.question: default:
      return {
        canStop: v => v === 1,
        isSufficient: () => true,
      }
  }
}

export const generate = function(generator, validator, amountIn) {
  const values = []
  const ah = amountHandler(amountIn)

  for (const value of generator) {
    if (ah.canStop(values.length)) {
      generator.return()
    }

    else if (validator.check(value)) {
      values.push(value)
    }
  }

  return {
    values: values,
    sufficient /* for eval */: ah.isSufficient(values.length),
  }
}
