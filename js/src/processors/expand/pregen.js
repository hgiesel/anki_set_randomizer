import {
  expandPickValueSet as expandPickValueSetOrig,
  expandValueSet as expandValueSetOrig,
} from './vs.js'

import {
  expandPickNumber as expandPickNumberOrig,
} from './number.js'

// Adapter for expanders
export const pregenManager = function(generatedValues, uniqConstraints, valueSets, evaluators) {
  const evs = (vm, args) => expandValueSetOrig(uniqConstraints, valueSets, evaluators, vm, ...args)
  const epvs = (vm, args) => expandPickValueSetOrig(uniqConstraints, valueSets, vm, ...args)
  const epn = (vm, args) => expandPickNumberOrig(uniqConstraints, vm, ...args)

  const pregenChecker = function(iterName, setIndex, elemIndex) {
    const valueMemory = function() {
      const pregen = generatedValues
        .find(([iter, setid, elemid]) => (
          iter === iterName
          && setid === setIndex
          && elemid === elemIndex
        ))

      const exists = function(evaluation = null) {
        if (evaluation) {
          return Boolean(pregen) && pregen[3].hasOwnProperty(JSON.stringify(evaluation))
        }

        else {
          return Boolean(pregen)
        }
      }

      const get = function(evaluation = null) {
        if (evaluation) /* for evals */ {
          const evaluationKey = JSON.stringify(evaluation)

          if (exists(evaluation)) {
            return pregen[3][evaluationKey]
          }
          else {
            return null
          }
        }

        if (exists()) /* for picks */ {
          return pregen[3]
        }
        else {
          return null
        }
      }


      const set = function(values, evaluation = null) {
        const evaluationKey = evaluation
          ? JSON.stringify(evaluation)
          : null

        if (!pregen) {
          if (evaluation) {
            generatedValues.push([iterName, setIndex, elemIndex, {[evaluationKey]: values}])
          }

          else {
            generatedValues.push([iterName, setIndex, elemIndex, values])
          }
        }

        else if (evaluation && !pregen[3].hasOwnProperty(evaluationKey)) {
          pregen[3][evaluationKey] = values
        }
      }

      return {
        exists: exists,
        get: get,
        set: set,
      }
    }

    const callthrough = function(f, args) {
      const resultValues = f(valueMemory(), args)
      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const expandPickNumber = (...args) => callthrough(epn, args)
    const expandPickValueSet = (...args) => callthrough(epvs, args)
    const expandValueSet = (...args) => callthrough(evs, args)

    return {
      expandPickNumber: expandPickNumber,
      expandPickValueSet: expandPickValueSet,
      expandValueSet: expandValueSet,
    }
  }

  const exportGeneratedValues = () => generatedValues
  const exportUniqConstraints = () => uniqConstraints

  return {
    pregenChecker: pregenChecker,
    exportGeneratedValues: exportGeneratedValues,
    exportUniqConstraints: exportUniqConstraints,
  }
}

export default pregenManager
