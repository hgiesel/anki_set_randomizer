
// for $n($val, s0) $copy($val, 1, +0) $del($val, 1, +0) $apply($val, s0)
import {
  processNamedSet as pns,
  processOrderConstraint as poc,
} from './shuffling.js'

import {
  processCommand as pc,
} from './commands.js'

import {
  processApplication as pa,
} from './stylings.js'

// Adapter for numbered.js evals
export function ruleEngine(numberedSets) {

  const callthrough = function(f, vs, iterName, setIndex, posIndex, argumentz) {
  }

  const processNamedSet = (iterName, setIndex, posIndex, vs, ...argumentz) => callthrough(pns, vs, setIndex, posIndex, argumentz)
  const processCommand = (iterName, setIndex, posIndex, vs, ...argumentz) => callthrough(pc, vs, setIndex, posIndex, argumentz)
  const processApplication = (iterName, setIndex, posIndex, vs, ...argumentz) => callthrough(pa, vs, setIndex, posIndex, argumentz)

  return {
    processNamedSet: processNamedSet,
    processCommand: processCommand,
    processAplication: processAplication,
  }
}
