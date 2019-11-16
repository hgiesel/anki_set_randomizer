import {
  vsNone, vsSome, vsStar, uniqSome,
  isSRToken,
  fromSRToken,
} from '../util.js'

import {
  preprocessVs,
} from '../processors/preprocess'

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
export const ruleEngine = function(elements, uniquenessConstraints, setToShuffles, yanks, iterNameOuter) {
  const elementsValues = elements
    .map(set => set
      .filter(elem => isSRToken(elem[3], 'value'))
    )

  const namedSets = createDefaultNames(elements, iterNameOuter)

  const orderConstraints = []
  const commands = []

  const orderApplications = {/* for guaranteeing, every set has max of one order */}
  const styleApplications = {}

  const callthrough = function(f, ...argumentz) {
    f(...argumentz)
  }

  const rulethrough = function(
    f, iterName, setIndex, elemIndex, appliedName, evalNames, allowYanks, rule,
    ...argumentz
  ) {
    const g = function(
      vs, [
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
        (vs.name === vsStar || vs.name === vsName)
        && (vs.sub === vsStar || vs.sub === Number(vsSub))
        && (vs.pos === vsStar || vs.pos === Number(vsPos))
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

    switch (rule.type) {
      case uniqSome:
        const uniqSet = uniquenessConstraints
          .find(({name}) => name === rule.name)

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

      case vsSome:
        for (const setId in elementsValues) {
          for (const elem of elementsValues[setId]) {
            g(rule, elem, Number(setId))
          }
        }
        break

      case vsNone: default:
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
    iterName, setIndex, posIndex,

    rule, shuffleName, appliedName, options,
  ) {
    rulethrough(
      pns, iterName, setIndex, posIndex, appliedName, true, false, rule,
      shuffleName, options, namedSets,
    )
  }

  const processOrder = function(
    iterName, setIndex, posIndex,

    rule, orderName, appliedName, options,
  ) {
    rulethrough(
      po, iterName, setIndex, posIndex, appliedName, false, false, rule,
      orderName, options, orderConstraints, orderApplications, namedSets,
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

    rule, styleName, appliedName,
  ) {
    rulethrough(
      pa, iterName, setIndex, posIndex, appliedName, true, true, rule,
      styleName, styleApplications,
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

  const exportStyleApplications = function() {
    return styleApplications
  }

  const lateEvaluate = function(
    namedSetStatements,
    orderStatements,
    commandStatements,
    applyStatements,
  ) {
    namedSetStatements
      .reduce((accu, elem) => {
        elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
          ? accu.push(elem)
          : accu.unshift(elem)
        return accu
      }, [])
      .forEach(stmt => processNamedSet(...stmt))

    orderStatements.forEach(stmt => processOrder(...stmt))
    commandStatements.forEach(stmt => processCommand(...stmt))
    applyStatements.forEach(stmt => processApplication(...stmt))
  }

  return {
    lateEvaluate: lateEvaluate,

    exportRandomizationData: exportRandomizationData,
    exportStyleApplications: exportStyleApplications,
  }
}

export default ruleEngine
