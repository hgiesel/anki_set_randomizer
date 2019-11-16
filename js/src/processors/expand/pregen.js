import {
  amountStar,
  vsStar,
} from '../../util.js'

import {
  expandPickValueSet as expandPickValueSetOrig,
  expandValueSet as expandValueSetOrig,
} from './vs.js'

import {
  expandPickNumber as expandPickNumberOrig,
} from './number.js'

const isPregenNecessaryFromVs = function(amount, vs) {
  return (amount.type !== amountStar
    && (vs.name === vsStar || vs.sub === vsStar || vs.pos === vsStar))
}

const isPregenNecessaryFromPickNumber = function(amount) {
  return (amount.type !== amountStar)
}

// Adapter for expanders
export const pregenManager = function(generatedValues, uniqConstraints, valueSets, evaluators) {
  const evs = args => expandValueSetOrig(uniqConstraints, valueSets, evaluators, ...args)
  const epvs = args => expandPickValueSetOrig(uniqConstraints, valueSets, ...args)
  const epn = args => expandPickNumberOrig(uniqConstraints, ...args)

  const pregenChecker = function(iterName, setIndex, elemIndex) {
    const checkForPregen = function() {
      let pregen = null

      if (pregen = generatedValues
        .find(([iter, setid, elemid]) => (
          iter === iterName
          && setid === setIndex
          && elemid === elemIndex
        ))
      ) {
        return pregen[3]
      }

      return null
    }

    const callthrough = function(f, args, trulyRandom = false) {
      let resultValues = null

      if (trulyRandom) {
        resultValues = checkForPregen()

        if (!resultValues) {
          resultValues = f(args)
        }

        generatedValues.push([iterName, setIndex, elemIndex, resultValues])
      }

      else {
        resultValues = f(args)
      }

      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const expandPickNumber = (...args) => callthrough(
      epn, args, isPregenNecessaryFromPickNumber(args[0]),
    )

    const expandPickValueSet = (...args) => callthrough(
      epvs, args, isPregenNecessaryFromVs(args[0], args[1]),
    )

    const expandValueSet = (...args) => callthrough(
      evs, args, isPregenNecessaryFromVs(args[0], args[1]),
    )

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
