import {
  rule, vs,
} from '../types.js'

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
export const ruleEngine = function(uniquenessConstraints, setToShuffles, yanks) {
  let namedSets = null

  const orderConstraints = []
  const commands = []

  const orderApplications = {/* for guaranteeing, every set has max of one order */}
  const styleApplications = {}

  const filterValues = sets => sets
    .map(set => set
      .filter(elem => elem[3].type === elem.value)
    )

  const callthrough = function(f, ...argumentz) {
    f(...argumentz)
  }

  const rulethrough = function(
    f, iterName, setIndex, elemIndex, appliedName, evalNames, allowYanks, ruleVal,
    elements, elementsValues, ...argumentz
  ) {
    const g = function(
      vsVal, [
        iterNameInner,
        setIndexInner,
        elemIndexInner,
        content,
      ],
      trueSetId,
    ) {
      const [
        vsName,
        vsSub,
        vsPos,
      ] = fromSRToken(content)

      if (
        (vsVal.name === vs.star || vsVal.name === vsName)
        && (vsVal.sub === vs.star || vsVal.sub === Number(vsSub))
        && (vsVal.pos === vs.star || vsVal.pos === Number(vsPos))
      ) {
        const correspondingSets = getCorrespondingSets(
          elements,
          namedSets,
          yanks,
          appliedName,
          typeof trueSetId === 'number' ? trueSetId : setIndexInner /* not sure when this happens */,
          evalNames,
          allowYanks,
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

    switch (ruleVal.type) {
      case rule.uniq:
        const uniqSet = uniquenessConstraints
          .find(({name}) => name === ruleVal.name)

        if (uniqSet) {
          for (const value of uniqSet.values
            .filter(v => isSRToken(v, 'value'))
          ) {
            const vsMember = preprocessVs(fromSRToken(value, true))

            for (const setId in elementsValues) {
              for (const elem of elementsValues[setId]) {
                g(vsMember, elem, Number(setId))
              }
            }
          }
        }
        break

      case rule.vs:
        for (const setId in elementsValues) {
          for (const elem of elementsValues[setId]) {
            g(ruleVal, elem, Number(setId))
          }
        }
        break

      case rule.none: default:
        const correspondingSets = getCorrespondingSets(
          elements,
          namedSets,
          yanks,
          appliedName,
          setToShuffles[setIndex],
          evalNames,
          allowYanks,
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
    elements, ev, iterName, setIndex, posIndex,

    ruleData, shuffleName, appliedName, options,
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, appliedName, true, false, ruleData,
      elements, ev, shuffleName, options, namedSets,
    )
  }

  const processOrder = function(
    elements, ev, iterName, setIndex, posIndex,

    ruleData, orderName, appliedName, options,
  ) {
    rulethrough(
      po, iterName, setIndex, posIndex, appliedName, false, false, ruleData,
      elements, ev, orderName, options, orderConstraints, orderApplications, namedSets,
    )
  }

  const processCommand = function(
    // elements, ev, iterName, setIndex, posIndex,
    // copyCmd, moveCmd, delCmd, xchCmd, replCmd,
    // ...argumentz
  ) {
    // rulethrough(pc, iterName, setIndex, posIndex, 25, elements, namedSets, ...argumentz)
  }

  const processApplication = function(
    elements, ev, iterName, setIndex, posIndex,

    ruleData, styleName, appliedName,
  ) {
    rulethrough(
      pa, iterName, setIndex, posIndex, appliedName, true, true, ruleData,
      elements, ev, styleName, styleApplications,
    )
  }

  const exportRandomizationData = function(forced) {
    const orderApps = {}
    if (forced) {
      for (const key in orderApplications) {
        if (orderApplications[key][1]) {
          orderApps[key] = orderApplications[key][0]
        }
      }
    }

    else {
      for (const key in orderApplications) {
        orderApps[key] = orderApplications[key][0]
      }
    }

    return [
      forced ? namedSets.filter(ns => ns.force) : namedSets,
      (forced ? orderConstraints.filter(oc => oc.force) : orderConstraints),
      orderApps,
      forced ? [] : commands,
    ]
  }

  let savedApplyStatements = null
  const getStyleApplications = function(elements) {
    const elementsValues = filterValues(elements)

    savedApplyStatements.forEach(stmt => processApplication(elements, elementsValues, ...stmt))
    return styleApplications
  }

  const lateEvaluate = function(
    elements,
    iterNameOuter,
    namedSetStatements,
    orderStatements,
    commandStatements,
    applyStatements,
  ) {
    namedSets = createDefaultNames(elements, iterNameOuter)
    const elementsValues = filterValues(elements)

    namedSetStatements
      .reduce((accu, elem) => {
        elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
          ? accu.push(elem)
          : accu.unshift(elem)
        return accu
      }, [])
      .forEach(stmt => processNamedSet(elements, elementsValues, ...stmt))

    orderStatements.forEach(stmt => processOrder(elements, elementsValues, ...stmt))
    commandStatements.forEach(stmt => processCommand(elements, elementsValues, ...stmt))

    savedApplyStatements = applyStatements
  }

  return {
    lateEvaluate: lateEvaluate,

    exportRandomizationData: exportRandomizationData,
    getStyleApplications: getStyleApplications,
  }
}

export default ruleEngine
