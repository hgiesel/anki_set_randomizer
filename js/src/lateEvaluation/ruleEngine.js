import {
  isSRToken,
  fromSRToken,
} from '../util.js'

import {
  evalKeywordArguments,
} from './util.js'

import {
  processNamedSet as pns,
  processOrderConstraint as poc,
} from './shuffling.js'

import {
  processCommand as pc,
} from './commands.js'

import {
  getNullStyleApplications,
  processApplication as pa,
} from './styleApplier.js'

import styleSetter from './styleSetter.js'

// Adapter for numbered.js evals
export default function ruleEngine(numberedSets, defaultStyle) {

  const values = numberedSets
    .map(set => set.elements)
    .flat()
    .filter(elem => isSRToken(elem[3], 'value'))

  const namedSets        = []
  const orderConstraints = []

  const commands         = []

  const ss = styleSetter(defaultStyle)
  const styleApplications = getNullStyleApplications(numberedSets)

  const callthrough = function(f, iterName, setIndex, posIndex, argumentz) {
    f(iterName, setIndex, posIndex, ...argumentz)
  }

  const rulethrough = function(
    f, iterName, setIndex, posIndex,
    vs, vsSetIndex, vsSetStar, vsValueIndex, vsValueStar,
    ...argumentz
  ) {
    if (vs) {
      values
        .filter(value => {
          const [
            vsname,
            vssetindex,
            vsvalueindex,
          ] = fromSRToken(value[3]).slice(1)

          return (
            (vs === '*'  || vs === vsname) &&
            (vsSetIndex   === undefined || vsSetStar   || vsSetIndex   === vssetindex) &&
            (vsValueIndex === undefined || vsValueStar || vsValueIndex === vsvalueindex)
          )
        })
        .forEach(value => callthrough(f, value[0], value[1], value[2], argumentz))
    }

    else {
      callthrough(f, iterName, setIndex, posIndex, argumentz)
    }
  }

  /////////////////////////////

  const processNamedSet = function(
    iterName, setIndex, posIndex,
    ...argumentz
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, ...argumentz,
      numberedSets, namedSets,
    )
  }

  const processCommand = function(
    iterName, setIndex, posIndex,
    copyCmd, moveCmd, delCmd, xchCmd, replCmd,
    ...argumentz
  ) {
    // rulethrough(pc, iterName, setIndex, posIndex, 25, numberedSets, namedSets, ...argumentz)
      // toOptArg(evalKeywordArguments(argumentz[argumentz.length])), numberedSets, namedSets,
  }

  const processStyle = function(
    iterName, setIndex, posIndex,
    styleName, kwArgs,
  ) {
    evalKeywordArguments(kwArgs)
      .forEach(pair => ss.setStyleAttribute(styleName, pair[0], pair[1]))
  }

  const processApplication = function(
    iterName, setIndex, posIndex,
    ...argumentz
  ) {
    rulethrough(pa, iterName, setIndex, posIndex, ...argumentz, numberedSets, namedSets, styleApplications)
  }

  const exportResults = () => [namedSets, orderConstraints, commands, ss.exportStyleDefinitions(), styleApplications]

  return {
    processNamedSet: processNamedSet,
    processCommand: processCommand,
    processStyle: processStyle,
    processApplication: processApplication,
    exportResults: exportResults,
  }
}
