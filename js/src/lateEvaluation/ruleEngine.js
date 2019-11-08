import {
  vsNone, vsSome, vsStar,

  isSRToken,
  fromSRToken,
} from '../util.js'

import {
  getCorrespondingSets,
  evalKeywordArguments,
  keywordProcess,
} from './util.js'

import {
  processNamedSet as pns,
  processOrder as po,
} from './shuffling.js'

import {
  processCommand as pc,
} from './commands.js'

import {
  processApplication as pa,
} from './styleApplier.js'

import styleSetter from './styleSetter.js'

// Adapter for numbered.js evals
export const ruleEngine = function(numberedSets, yanks, defaultStyle) {
  const elementsValues = numberedSets
    .map(set => set.elements)
    .flat()
    .filter(elem => isSRToken(elem[3], 'value'))

  const namedSets = []
  const orderConstraints = []
  const commands = []

  const ss = styleSetter(defaultStyle)
  const styleApplications = {}

  const callthrough = function(f, ...argumentz) {
    f(...argumentz)
  }

  const rulethrough = function(
    f, iterName, setIndex, elemIndex, appliedName, vs,
    ...argumentz
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
        && (vs.sub === vsStar || vs.sub === Number(vsSub))
        && (vs.pos === vsStar || vs.pos === Number(vsPos))
      ) {
        const correspondingSets = getCorrespondingSets(
          numberedSets,
          namedSets,
          yanks,
          appliedName,
          setIndexInner,
        )

        callthrough(
          f,
          iterNameInner,
          setIndexInner,
          elemIndexInner,
          correspondingSets,
          ...argumentz,
        )
      }
    }

    switch (vs.type) {
      case vsSome:
        elementsValues.forEach(g)
        break

      case vsNone: default:
        const correspondingSets = getCorrespondingSets(
          numberedSets,
          namedSets,
          yanks,
          appliedName,
          setIndex,
        )

        callthrough(
          f,
          iterName,
          setIndex,
          elemIndex,
          correspondingSets,
          ...argumentz,
        )
        break
    }
  }

  /////////////////////////////
  const processStyle = function(
    iterName, setIndex, posIndex,
    styleName, kwArgs,
  ) {
    evalKeywordArguments(kwArgs)
      .forEach(pair => ss.setStyleAttribute(styleName, pair[0], pair[1]))
  }

  const processNamedSet = function(
    iterName, setIndex, posIndex,

    vs, shuffleName, appliedName, kwargs,
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, appliedName, vs,
      shuffleName, keywordProcess(kwargs), namedSets,
    )
  }

  const processOrder = function(
    iterName, setIndex, posIndex,

    vs, orderName, appliedName, kwargs,
  ) {
    rulethrough(
      po, iterName, setIndex, posIndex, appliedName, vs,
      orderName, keywordProcess(kwargs), orderConstraints, namedSets,
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

  const processApplication = function(
    iterName, setIndex, posIndex,

    vs, styleName, appliedName,
  ) {
    rulethrough(
      pa, iterName, setIndex, posIndex, appliedName, vs,
      styleName, styleApplications,
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
    processOrder: processOrder,
    processCommand: processCommand,
    processStyle: processStyle,
    processApplication: processApplication,

    exportResults: exportResults,
  }
}

export default ruleEngine
