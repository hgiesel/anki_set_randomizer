import {
  vsNone, vsSome, vsStar,

  isSRToken,
  fromSRToken,
} from '../util.js'

import {
  evalKeywordArguments,
} from './util.js'

import {
  processNamedSet as pns,
} from './shuffling.js'

import {
  processCommand as pc,
} from './commands.js'

import {
  processApplication as pa,
} from './styleApplier.js'

import styleSetter from './styleSetter.js'

// Adapter for numbered.js evals
export const ruleEngine = function(numberedSets, defaultStyle) {
  const elementsValues = numberedSets
    .map(set => set.elements)
    .flat()
    .filter(elem => isSRToken(elem[3], 'value'))

  const namedSets = []
  const orderConstraints = []
  const commands = []

  const ss = styleSetter(defaultStyle)
  const styleApplications = {}

  const callthrough = function(
    f,
    iterName,
    setIndex,
    posIndex,
    argumentz,
  ) {
    f(
      iterName,
      setIndex,
      posIndex,
      ...argumentz
    )
  }

  const rulethrough = function(
    f, iterName, setIndex, elemIndex,
    vs, ...argumentz
  ) {
    const g = function([
      iterNameInner,
      setIndexInner,
      elemIndexInner,
      content
    ]) {
      const [
        vsName,
        vsSub,
        vsPos,
      ] = fromSRToken(content)

      if (
        (vs.name === vsStar || vs.name === vsName)
        && (vs.sub === vsStar || vs.sub === vsSub)
        && (vs.pos === vsStar || vs.pos === vsPos)
      ) {
        callthrough(
          f,
          iterNameInner,
          setIndexInner,
          elemIndexInner,
          argumentz,
        )
      }
    }

    switch (vs.type) {
      case vsSome:
        elementsValues.forEach(g)
        break

      case vsNone: default:
        callthrough(
          f,
          iterName,
          setIndex,
          elemIndex,
          argumentz,
        )
        break
    }
  }

  /////////////////////////////

  const processNamedSet = function(
    iterName, setIndex, posIndex,
    ...argumentz
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, ...argumentz,
      numberedSets, namedSets, orderConstraints,
    )
  }

  const processCommand = function(
    // iterName, setIndex, posIndex,
    // copyCmd, moveCmd, delCmd, xchCmd, replCmd,
    // ...argumentz
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
    rulethrough(
      pa,
      iterName, setIndex, posIndex,

      ...argumentz,
      numberedSets,
      namedSets,
      styleApplications
    )
  }

  const exportResults = () => [
    namedSets,
    orderConstraints,
    commands,
    ss.exportStyleDefinitions(),
    styleApplications
  ]

  return {
    processNamedSet: processNamedSet,
    processCommand: processCommand,
    processStyle: processStyle,
    processApplication: processApplication,
    exportResults: exportResults,
  }
}

export default ruleEngine
