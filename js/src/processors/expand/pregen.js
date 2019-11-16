import {
  expandPickValueSet as expandPickValueSetOrig,
  expandValueSet as expandValueSetOrig,
} from './vs.js'

import {
  expandPickNumber as expandPickNumberOrig,
} from './number.js'

// Adapter for expanders
export const pregenManager = function(generatedValues, uniqConstraints, valueSets, evaluators) {
  const evs = args => expandValueSetOrig(uniqConstraints, valueSets, evaluators, ...args)
  const epvs = args => expandPickValueSetOrig(uniqConstraints, valueSets, ...args)
  const epn = args => expandPickNumberOrig(uniqConstraints, ...args)

  const pregenChecker = function(iterName, setIndex, elemIndex) {
    const pregenResult = 'pregenResult'
    const pregenFail = 'pregenFail'

    const checkForPregen = function() {
      let pregen = null

      if (pregen = generatedValues
        .find(([iter, setid, elemid]) => (
          iter === iterName
          && setid === setIndex
          && elemid === elemIndex
        ))
      ) {
        return {
          type: pregenResult,
          value: pregen[3],
        }
      }

      return {
        type: pregenFail,
        value: null,
      }
    }

    const callthroughPick = function(f, args) {
      const pregen = checkForPregen()
      let resultValues = null

      switch (pregen.type) {
        case pregenResult:
          resultValues = pregen.value
          break

        case pregenFail: default:
          let trulyRandom = null
          ;[resultValues, trulyRandom] = f(args)

          if (trulyRandom) {
            generatedValues.push([iterName, setIndex, elemIndex, resultValues])
          }
          break
      }

      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const callthroughVs = function(f, args) {
      let resultValues = null
      const [
        values,
        evaluator,
        trulyRandom,
      ] = f(args)

      const maybePregen = checkForPregen()
      const evaluatorKey = JSON.stringify(evaluator)

      switch (maybePregen.type) {
        case pregenResult:
          if (maybePregen.value.hasOwnProperty(evaluatorKey)) {
            resultValues = maybePregen.value[evaluatorKey]
          }
          else {
            if (trulyRandom) {
              maybePregen.value[evaluatorKey] = values
            }
            resultValues = values
          }
          break

        case pregenFail: default:
          if (trulyRandom) {
            generatedValues.push([iterName, setIndex, elemIndex, {[evaluatorKey]: values}])
          }
          resultValues = values
          break
      }

      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const expandPickNumber = (...args) => callthroughPick(epn, args)
    const expandPickValueSet = (...args) => callthroughPick(epvs, args)
    const expandValueSet = (...args) => callthroughVs(evs, args)

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
