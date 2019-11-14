import {
  vsNone, vsSome, vsStar,

  isSRToken,
  fromSRToken,
} from '../util.js'

import {
  getCorrespondingSets,
} from './util.js'

import {
  createDefaultNames,
  processNamedSet as pns,
  processOrder as po,
} from './shuffling.js'

import {
  processCommand as pc,
} from './commands.js'

import {
  processApplication as pa,
} from './styleApplier.js'

// Adapter for numbered.js evals
export const ruleEngine = function(elements, yanks, iterNameOuter) {
  const elementsValues = elements
    .flat()
    .filter(elem => isSRToken(elem[3], 'value'))

  const namedSets = createDefaultNames(elements, iterNameOuter)
  const orderConstraints = []
  const commands = []

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
          elements,
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
          elements,
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
  const processNamedSet = function(
    iterName, setIndex, posIndex,

    vs, shuffleName, appliedName, options,
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, appliedName, vs,
      shuffleName, options, namedSets,
    )
  }

  const processOrder = function(
    iterName, setIndex, posIndex,

    vs, orderName, appliedName, options,
  ) {
    rulethrough(
      po, iterName, setIndex, posIndex, appliedName, vs,
      orderName, options, orderConstraints, namedSets,
    )
  }

  const processCommand = function(
    // iterName, setIndex, posIndex,
    // copyCmd, moveCmd, delCmd, xchCmd, replCmd,
    // ...argumentz
  ) {
    // rulethrough(pc, iterName, setIndex, posIndex, 25, elements, namedSets, ...argumentz)
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

  const exportRandomizationData = function(forced) {
    return [
      forced ? namedSets.filter(ns => ns.force) : namedSets,
      forced ? orderConstraints.filter(oc => oc.force) : orderConstraints,
      forced ? [] : commands,
    ]
  }

  const exportStyleApplications = function() {
    return styleApplications
  }

  return {
    processNamedSet: processNamedSet,
    processOrder: processOrder,
    processCommand: processCommand,
    processApplication: processApplication,

    exportRandomizationData: exportRandomizationData,
    exportStyleApplications: exportStyleApplications,
  }
}

export default ruleEngine
