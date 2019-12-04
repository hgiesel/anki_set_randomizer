import {
  elem, rule, vs, extract,
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

const filterValues = sets => sets
  .map(set => set
    .filter(element => element[3].type === elem.value)
  )

export const ruleEngine = function(
  uniquenessConstraints,
  setToShuffles,
  yanks,
  iterNameOuter,
  namedSetStatements,
  orderStatements,
  commandStatements,
  applyStatements,
) {
  let namedSets = null

  const orderConstraints = []
  const commands = []

  const orderApplications = {/* for guaranteeing, every set has max of one order */}
  const styleApplications = {}

  const callthrough = function(f, ...argumentz) {
    f(...argumentz)
  }

  const rulethrough = function(
    f, iterName, setIndex, elemIndex, appliedName, evalNames, allowYanks, ruleVal,
    elements, elementsValues, ...argumentz
  ) {
    const checkRule = function(
      vsVal, [
        iterNameInner,
        setIndexInner,
        elemIndexInner,
        content,
      ],
      trueSetId,
    ) {
      const testValue = extract(content)

      if (
        (vsVal.name === vs.star || vsVal.name === testValue.name)
        && (vsVal.sub === vs.star || vsVal.sub === testValue.sub)
        && (vsVal.pos === vs.star || vsVal.pos === testValue.pos)
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
        // no invalid name specifiable
        const uniqRule = extract(extract(ruleVal))
        const uniqSet = uniquenessConstraints
          .find(({name}) => name === uniqRule)

        if (uniqSet) {
          for (const value of uniqSet.values
            .filter(v => v.type === elem.value)
          ) {
            for (const setId in elementsValues) {
              const setNum = Number(setId)

              for (const element of elementsValues[setNum]) {
                checkRule(extract(value), element, setNum)
              }
            }
          }
        }
        break

      case rule.vs:
        for (const setId in elementsValues) {
          const setNum = Number(setId)

          for (const element of elementsValues[setNum]) {
            // cannot be vsNone inside of ruleVs
            checkRule(extract(extract(ruleVal)), element, setNum)
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

  const getRandomizationData = function(elements) {
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

    const orderApps = {}
    for (const key in orderApplications) {
      orderApps[key] = orderApplications[key][0]
    }

    return [
      namedSets,
      orderConstraints,
      orderApps,
    ]
  }

  const getCommands = function(elements) {
    const elementsValues = filterValues(elements)
    commandStatements.forEach(stmt => processCommand(elements, elementsValues, ...stmt))
    return commands
  }

  const getStyleApplications = function(elements) {
    const elementsValues = filterValues(elements)

    applyStatements.forEach(stmt => processApplication(elements, elementsValues, ...stmt))
    return styleApplications
  }

  return {
    getRandomizationData: getRandomizationData,
    getCommands: getCommands,
    getStyleApplications: getStyleApplications,
  }
}

export default ruleEngine
