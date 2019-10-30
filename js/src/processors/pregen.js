import {
  evalPickNumber as epn,
  evalPickValueSet as epvs,
  evalValueSet as evs,
} from './numbered.js'

// Adapter for numbered.js evals
export function pregenManager(generatedValues, uniqConstraints,) {

  const pregenChecker = function(iterName, setIndex, elemIndex) {

    const checkForPregen = function() {
      let pregen
      if (pregen = generatedValues
        .find(v =>
          v[0] === iterName &&
          v[1] === setIndex &&
          v[2] === elemIndex)) {
        return pregen[3]
      }

      return null
    }

    const callthrough = function(f, argumentz) {
      let resultValues = checkForPregen()

      if (!resultValues) {
        resultValues = f(uniqConstraints, ...argumentz)
      }

      generatedValues.push([iterName, setIndex, elemIndex, resultValues])
      return resultValues.map(v => [iterName, setIndex, elemIndex, v, 'n'])
    }

    const evalPickNumber = (...argumentz) => callthrough(epn, argumentz)
    const evalPickValueSet = (...argumentz) => callthrough(epvs, argumentz)
    const evalValueSet = (...argumentz) => callthrough(evs, argumentz)

    return {
      evalPickNumber: evalPickNumber,
      evalPickValueSet: evalPickValueSet,
      evalValueSet: evalValueSet,
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
