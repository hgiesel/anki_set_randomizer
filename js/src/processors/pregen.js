import {
  expandPickNumber as epn,
  expandPickValueSet as epvs,
  expandValueSet as evs,
} from './expandGenerators.js'

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

    const callthrough = function(f, argumentz) {
      let resultValues = checkForPregen()

      if (!resultValues) {
        resultValues = f(uniqConstraints, ...argumentz)
      }

      console.log('bbbbbb', resultValues.map(v => [0, v]))
      generatedValues.push([iterName, setIndex, elemIndex, resultValues])
      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const expandPickNumber = (...argumentz) => callthrough(epn, argumentz)
    const expandPickValueSet = (...argumentz) => callthrough(epvs, argumentz)
    const expandValueSet = (...argumentz) => callthrough(evs, argumentz)

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
