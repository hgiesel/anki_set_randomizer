import {
  vsStar,
  pickInt,
  uniqSome, uniqCond, uniqNone,
  amountCount, amountStar,

  toSRToken,
} from '../util.js'

const triesMax = 100

const generateRandomInt = function(min, max, extra) {
  const preValue = Math.random() * (max - min) + min
  return String(Math.round(preValue) * extra)
}

const generateRandomReal = function(min, max, extra) {
  const preValue = Math.random() * (max - min) + min
  return preValue.toFixed(extra)
}

const getUc = function(uniqConstraints, uc) {
  return uniqConstraints.find(v => v.name === uc.name)
    || uniqConstraints[uniqConstraints.push({ name: uc.name, values: [] }) - 1]
}

const getProcessUniqCond = function(uniqConstraints) {
  const processUniqCond = function(condition, currentVsValue) {
    switch (condition[0]) {
      case '&':
        return condition
          .slice(1)
          .map(processUniqCond)
          .reduce((accu, v) => accu && v)

      case '|':
        return condition
          .slice(1)
          .map(processUniqCond)
          .reduce((accu, v) => accu || v)

      case '!':
        return !processUniqCond(condition[1])

      default:
        switch (condition[1]) {
          case 'includes':
            return uniqConstraints[condition[0]].includes(condition[2])

          case '!includes':
            return !uniqConstraints[condition[0]].includes(condition[2])

          case '<':
            return uniqConstraints[condition[0]].length < condition[2]

          case '<=':
            return uniqConstraints[condition[0]].length <= condition[2]

          case 'eq':
            return uniqConstraints[condition[0]].length === condition[2]

          case 'neq':
            return uniqConstraints[condition[0]].length !== condition[2]

          case '>=':
            return uniqConstraints[condition[0]].length >= condition[2]

          case '>':
            return uniqConstraints[condition[0]].length > condition[2]

          case '%':
            return (uniqConstraints[condition[0]].length % condition[2]) === 0

          default:
            break
        }
    }
  }

  return {
    processUniqCond: processUniqCond,
  }
}

export const expandPickNumber = function(
  uniqConstraints,

  amount,
  pick,
  uc,
) {
  const ucList = uc.type === uniqSome
    ? getUc(uniqConstraints, uc)
    : null

  const generate = pick.type === pickInt
    ? generateRandomInt
    : generateRandomReal /* pickReal */

  const resultValues = []

  switch (amount.type) {
    case amountCount:
      for (let i = 0; i < amount.value; i++) {
        let resultValue = generate(pick.min, pick.max, pick.extra)

        for (let tries = 0; ucList && tries < triesMax; tries++) {
          resultValue = generate(pick.min, pick.max, pick.extra)

          if (!ucList.values.includes(resultValue)) {
            break
          }

          resultValue = null
        }

        /* adding to resultValues */
        if (typeof resultValue !== 'string') {
          break
        }

        if (ucList) {
          ucList.values.push(resultValue)
        }

        resultValues.push(resultValue)
      }
      break

    case amountStar: default:
      const preresultValues = pick.type === pickInt
        ? [...Array(pick.max - pick.min + 1).keys()]
          .map(v => v + pick.min)
          .filter(v => v % pick.extra === 0)
          .map(String)
        : [/* pickReal has infinite values */]

      if (ucList) {
        resultValues.push(...preresultValues
          .filter(value => !ucList.values.includes(value))
        )

        ucList.values.push(...resultValues)
      }
      else {
        resultValues.push(...preresultValues)
      }
      break
  }

  debugger
  return resultValues
}

const getAllVsValues = function(valueSets, vs) {
  const vsNames = vs.name === vsStar
    ? Object.keys(valueSets)
    : [vs.name]

  const result = []

  for (const vsName of vsNames) {
    if (vs.sub === vsStar) {
      for (const [subIdx, sub] of valueSets[vsName].entries()) {
        if (vs.pos === vsStar) {
          for (const [posIdx /*, value */] of sub.values.entries()) {
            result.push(toSRToken(['value', vsName, subIdx, posIdx]))
          }
        }

        else if (typeof sub.values[vs.pos] === 'string') {
          result.push(toSRToken(['value', vsName, subIdx, vs.pos]))
        }
      }
    }

    else if (valueSets[vsName][vs.sub]) {
      if (vs.pos === vsStar) {
        for (const [posIdx /*, value */] of valueSets[vsName][vs.sub].values.entries()) {
          result.push(toSRToken(['value', vsName, vs.sub, posIdx]))
        }
      }

      else if (typeof valueSets[vsName][vs.sub].values[vs.pos] === 'string') {
        result.push(toSRToken(['value', vsName, vs.sub, vs.pos]))
      }
    }
  }

  return result
}

const getVsValue = function(valueSets, vs) {
  const foundVs = valueSets[
    vs.name === vsStar
    ? Object.keys(valueSets)[Math.floor(Math.random() * Object.keys(valueSets).length)]
    : vs.name
  ]

  const vsSub = foundVs && vs.sub === vsStar
    ? Math.floor(Math.random() * foundVs.length)
    : vs.sub

  const foundVsSub = foundVs && foundVs.length > 0
    ? foundVs[vsSub]
    : null

  const foundVsPos = foundVsSub && vs.pos === vsStar
    ? Math.floor(Math.random() * foundVsSub.values.length)
    : vs.pos < foundVsSub.values.length
    ? vs.pos
    : null

  const resultValue = foundVs && vsSub >= 0 && foundVsPos >= 0
    ? toSRToken(['value', foundVsSub.name, vsSub, foundVsPos])
    : null

  return resultValue
}

export const expandPickValueSet = function(
  uniqConstraints,

  amount,
  vs,
  uc,

  valueSets,
) {
  const resultValues = []
  const ucList = uc.type === uniqSome
    ? getUc(uniqConstraints, uc)
    : null

  switch (amount.type) {
    case amountCount:
      for (let i = 0; i < amount.value; i++) {
        let resultValue = getVsValue(valueSets, vs)

        /* dealing with uc */
        for (let tries = 0; ucList && tries < triesMax; tries++) {
          resultValue = getVsValue(valueSets, vs)

          if (!ucList.values.includes(resultValue)) {
            break
          }

          resultValue = null
        }

        /* adding to resultValues */
        if (typeof resultValue === 'string') {
          if (ucList) {
            ucList.values.push(resultValue)
          }

          resultValues.push(resultValue)
        }
      }
      break

    case amountStar: default:
      const preresultValues = getAllVsValues(valueSets, vs)

      if (ucList) {
        resultValues.push(...preresultValues
          .filter(value => !ucList.values.includes(value))
        )

        ucList.values.push(...resultValues)
      }

      else {
        resultValues.push(...preresultValues)
      }
      break
  }

  return resultValues
}

export const expandValueSet = function(
  uniqConstraints,

  vsName,
  vsSub,

  valueSets,
  evaluators,
) {
  const resolvedValues = []

  const foundEvaluator = evaluators.find(([/* amount */, evalVs /*, uc */]) => (
    (evalVs.name === vsStar || evalVs.name === vsName)
    && (evalVs.sub === vsStar || evalVs.sub === vsSub)
  ))

  if (foundEvaluator) {
    const [
      amount,
      theVs,
      uc,
    ] = foundEvaluator

    const ucList = uc.type === uniqSome
      ? getUc(uniqConstraints, uc)
      : null

    switch (amount.type) {
      case amountCount:
        for (let i = 0; i < amount.value; i++) {
          let resultValue = getVsValue(valueSets, {
            name: vsName,
            sub: vsSub,
            pos: theVs.pos
          })

          /* dealing with uc */
          for (let tries = 0; ucList && tries < triesMax; tries++) {
            resultValue = getVsValue(valueSets, {
              name: vsName,
              sub: vsSub,
              pos: theVs.pos,
            })

            if (!ucList.values.includes(resultValue)) {
              break
            }

            resultValue = null
          }

          /* adding to resultValues */
          if (typeof resultValue === 'string') {
            if (ucList) {
              ucList.values.push(resultValue)
            }

            resolvedValues.push(resultValue)
          }
        }
        break

      case amountStar: default:
        const preresultValues = getAllVsValues(valueSets, {
          name: vsName,
          sub: vsSub,
          pos: theVs.pos,
        })

        if (ucList) {
          resolvedValues.push(...preresultValues
            .filter(value => !ucList.values.includes(value))
          )

          ucList.push(...resolvedValues)
        }

        else {
          resolvedValues.push(...preresultValues)
        }
        break
    }
  }

  return resolvedValues
}
