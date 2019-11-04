import {
  expandPickNumber as epn,
  expandPickValueSet as epvs,
  expandValueSet as evs,
} from './expandGenerators.js'

import {
  amountStar,
  vsStar,
} from '../util.js'

const isPregenNecessaryFromVs = function(amount, vs) {
  return (amount.type !== amountStar
    && (vs.name === vsStar || vs.sub === vsStar || vs.pos === vsStar))
}

const isPregenNecessaryFromPickNumber = function(amount) {
  return (amount.type !== amountStar)
}

// Adapter for expanders
export const pregenManager = function(generatedValues, uniqConstraints) {
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

    const callthrough = function(f, argumentz, trulyRandom = false) {
      let resultValues = null

      if (trulyRandom) {
        resultValues = checkForPregen()

        if (!resultValues) {
          resultValues = f(uniqConstraints, ...argumentz)
        }

        generatedValues.push([iterName, setIndex, elemIndex, resultValues])
      }

      else {
        resultValues = f(uniqConstraints, ...argumentz)
      }

      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const expandPickNumber = (...argumentz) => callthrough(
      epn,
      argumentz,
      isPregenNecessaryFromPickNumber(argumentz[0]),
    )

    const expandPickValueSet = (...argumentz) => callthrough(
      epvs,
      argumentz,
      isPregenNecessaryFromVs(argumentz[0], argumentz[1]),
    )

    const expandValueSet = (...argumentz) => callthrough(
      evs,
      argumentz,
      isPregenNecessaryFromVs(argumentz[0], argumentz[1]),
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
