import {
  vs,
  uniq,
  amount,
  extract,
  tag,
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

    const getUniqSome = function(ucName) {
      return function(currentValue) {
        const uniqSet = getUc(uniqConstraints, ucName)
          .values
          .concat(preUcs[ucName] || [])

        if (!uniqSet.includes(currentValue)) {
          preUcs[uc.name]
            ? preUcs[ucName].push(currentValue)
            : preUcs[ucName] = [currentValue]
          return true
        }

        else {
          return false
        }
      }
    }

    const getUniqCond = function(ucData) {
      return function(currentValue) {
        const processUniqCondRecursive = function(condition) {
          if (condition.length === 0) {
            return true
          }

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
                .filter(value => value.type === currentValue.type)
                .concat(preUcs[condition[0]] || [])

              const comparisonValue = condition[2]
              let vsVal = null

              const currentVsData = extract(currentValue)

              switch (condition[1]) {
                case 'includes':
                  vsVal = extract(comparisonValue)

                  return Boolean(uniqSet.find((usVs) => {
                    const usVsData = extract(usVs)

                    return (vsVal.name === vs.star || (vsVal.name === vs.self ? currentVsData.name : vsVal.name) === usVsData.name)
                      && (vsVal.sub === vs.star || (vsVal.sub === vs.self ? currentVsData.sub : vsVal.sub) === usVsData.sub)
                      && (vsVal.pos === vs.star || (vsVal.pos === vs.self ? currentVsData.pos : vsVal.pos) === usVsData.pos)
                  }))

                case '!includes':
                  vsVal = extract(comparisonValue)

                  return !Boolean(uniqSet.find((usVs) => {
                    const usVsData = extract(usVs)

                    return (vsVal.name === vs.star || (vsVal.name === vs.self ? currentVsData.name : vsVal.name) === usVsData.name)
                      && (vsVal.sub === vs.star || (vsVal.sub === vs.self ? currentVsData.sub : vsVal.sub) === usVsData.sub)
                      && (vsVal.pos === vs.star || (vsVal.pos === vs.self ? currentVsData.pos : vsVal.pos) === usVsData.pos)
                  }))

                case '<': case '&lt;':
                  return uniqSet.length < comparisonValue

                case '<=': case '&lt;=':
                  return uniqSet.length <= comparisonValue

                case 'eq':
                  return uniqSet.length === comparisonValue

                case 'neq':
                  return uniqSet.length !== comparisonValue

                case '>=': case '&gt;=':
                  return uniqSet.length >= comparisonValue

                case '>': case '&gt;':
                  return uniqSet.length > comparisonValue

                case '%':
                  return (uniqSet.length % comparisonValue) === 0

                default:
                  return false
              }
          }
        }

        let passes = null

        try {
          passes = processUniqCondRecursive(ucData.name
            ? ['&', [ucData.name, '!includes', tag(vs.some, {
              name: vs.self,
              sub: vs.self,
              pos: vs.self,
            })], ucData.cond]
            : ucData.cond
          )
        }
        catch (e) {
          console.error('Invalid Uniqueness Condition', e)
          return false
        }

        for (const name of (passes
          ? (ucData.name
            ? ucData.add.concat(ucData.name)
            : ucData.add)
          : ucData.fail)
        ) {
          preUcs[name]
            ? preUcs[name].push(currentValue)
            : preUcs[name] = [currentValue]
        }

        return passes
      }
    }

    return {
      check: valueMemory
        ? /* no validating necessary */ () => true
        : uc.type === uniq.cond
        ? getUniqCond(extract(uc))
        : uc.type === uniq.some
        ? getUniqSome(extract(uc))
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
        canStop: v => v === amountData,
        isSufficient: v => v === amountData,
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
