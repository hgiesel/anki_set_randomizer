import {
  toSRToken,
} from '../util.js'

import {
  star,
} from '../util.js'

const generateRandomValue = function(
  min,
  max,
  extra,
  isReal,
) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

const findUniqConstraints = function(uniqConstraints, uniqConstraintName) {
  return uniqConstraintName
    ? uniqConstraints.find(v => v.name === uniqConstraintName)
      || uniqConstraints[uniqConstraints.push({
        name: uniqConstraintName,
        values: []
      }) - 1]
    : null
}

export const processEvaluator = function(
  amount,
  valueSetName,
  maybeNumberSetIndex, _star1,
  maybeNumberValueIndex, _star2,
  uniquenessConstraint,
) {
  const nsi = Number(maybeNumberSetIndex)
  const nvi = Number(maybeNumberValueIndex)

  const result = [
    valueSetName === '*'
      ? star
      : valueSetName,

    isNaN(nsi)
      ? star
      : nsi,

    isNaN(nvi)
      ? star
      : nvi,

    amount >= 0
      ? Number(amount)
      : 1,

    uniquenessConstraint,
  ]

  return result
}

const newLinePattern = /\\n/gu
const catchPattern = /\\./gu

export const processValueSet = function(
  valueSets,
  iterName, setIndex, elemIndex,

  valueSetName,
  valueSeparator,
  valueString
) {
  const values = valueString
    .replace(`\\${valueSeparator}`, toSRToken(['escdelim']))
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, x => x.slice(1))
    .split(valueSeparator)
    .map(v => v.replace(toSRToken(['escdelim']), valueSeparator))

  const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
    name: valueSetName,
    idx: valueSets[valueSetName] ? valueSets[valueSetName].length : 0,
    values: values,
    iter: iterName,
    set: setIndex,
    pos: elemIndex,
  }) - 1

  return toSRToken(['vs', valueSetName, valueSetIndex])
}

export const processPick = function(
  amountString,
  minValue, maxValue, extraValue,
  vsName,
  maybeVsSetIndex, _vssIndexStar,
  maybeVsValueIndex, _vsvIndexStar,
  maybeUniqConstraintName,
) {
  const amount = amountString /* star or number */ || 1

  const uniqConstraintName = maybeUniqConstraintName === ''
    ? `_unnamed${String(Math.random()).slice(2)}`
    : typeof maybeUniqConstraintName === 'string'
    ? maybeUniqConstraintName
    : ''

  if (minValue && maxValue) {
    const extraValueString = extraValue || ''

    return toSRToken([
      'pick:number',
      amount,
      minValue,
      maxValue,
      extraValueString,
      uniqConstraintName,
    ])
  }

  else {
    const vsSetIndex = isNaN(Number(maybeVsSetIndex))
      ? '*'
      : maybeVsSetIndex

    const vsValueIndex = isNaN(Number(maybeVsValueIndex))
      ? '*'
      : maybeVsValueIndex

    return toSRToken([
      'pick:vs',
      amount,
      vsName,
      vsSetIndex,
      vsValueIndex,
      uniqConstraintName,
    ])
  }
}

export const evalPickNumber = function(
  uniqConstraints,
  amount,
  minValue,
  maxValue,
  extraValue,
  uniqConstraintName
) {
  const theUc = findUniqConstraints(uniqConstraints, uniqConstraintName)
  const resultValues = []

  // generate a random integer or real number
  const isReal = minValue.includes('.') || maxValue.includes('.')

  for (let failedOnce = false, i = 0; i < amount; i++) {
    let resultValue

    if (failedOnce) {
      break;
    }

    resultValue = generateRandomValue(
      Number(minValue),
      Number(maxValue),
      Number(extraValue),
      isReal,
    )

    /* dealing with uc */
    if (theUc) {
      let countIdx = 0
      const countIdxMax = 100

      while (theUc.values.includes(resultValue) &&
        countIdx < countIdxMax) {

        resultValue = generateRandomValue(
          Number(minValue),
          Number(maxValue),
          Number(extraValue),
          isReal,
        )

        countIdx++
      }

      if (countIdx == countIdxMax) {
        resultValue = null
        failedOnce = true
      }
    }

    /* adding to resultValues */
    if (resultValue !== undefined && resultValue !== null) {

      if (theUc) {
        theUc.values.push(resultValue)
      }

      resultValues.push(resultValue)
    }
  }

  return resultValues
}

export const evalPickValueSet = function(
  uniqConstraints,
  valueSets,
  amount,
  vsName,
  valueSetSetIndex,
  valueSetPosIndex,
  uniqConstraintName,
) {
  const resultValues = []
  const theUc = findUniqConstraints(uniqConstraints, uniqConstraintName)

  for (let failedOnce = false, i = 0; i < amount; i++) {
    if (failedOnce) {
      break
    }

    const foundValueSet = valueSets[
      vsName === star
      ? Object.keys(valueSets)[Math.floor(Math.random() * Object.keys(valueSets).length)]
      : vsName
    ]

    const vidx = valueSetSetIndex === star
      ? Math.floor(Math.random() * foundValueSet.length)
      : valueSetSetIndex

    const foundValueSubSet = foundValueSet && foundValueSet.length > 0
      ? foundValueSet[vidx]
      : null

    let resultValue = foundValueSubSet
      ? valueSetSetIndex === star
        ? toSRToken(['value', foundValueSubSet.name, vidx, Math.floor(Math.random() * foundValueSubSet.values.length)])
        : toSRToken(['value', foundValueSubSet.name, vidx, valueSetPosIndex])
      : null

    /* dealing with uc */
    if (resultValue && theUc) {
      let countIdx = 0
      const countIdxMax = 100

      while (theUc.values.includes(resultValue) && countIdx < countIdxMax) {
        resultValue = foundValueSubSet
          ? valueSetSetIndex === star
            ? toSRToken(['value', foundValueSubSet.name, vidx, Math.floor(Math.random() * foundValueSubSet.values.length)])
            : toSRToken(['value', foundValueSubSet.name, vidx, valueSetPosIndex])
          : null

        countIdx++
      }

      if (countIdx === countIdxMax) {
        resultValue = null
        failedOnce = true
      }
    }

    /* adding to resultValues */
    if (typeof resultValue === 'string') {
      if (theUc) {
        theUc.values.push(resultValue)
      }

      resultValues.push(resultValue)
    }
  }

  return resultValues
}

export const evalValueSet = function(
  uniqConstraints,
  valueSets,
  evaluators,
  vsName,
  vsSetIndex,
) {
  const values = valueSets[vsName][vsSetIndex].values

  const foundEvaluator = evaluators.find(v => (
    (v[0] === vsName && v[1] === vsSetIndex)
    || (v[0] === vsName && v[1] === star)
    || (v[0] === star && v[1] === vsSetIndex)
    || (v[0] === star && v[1] === star) && (v[2] === star || v[2] < values.length)
  ))

  const resolvedValues = []

  if (foundEvaluator) {
    const valueId = foundEvaluator[2]
    const valueCount = foundEvaluator[3]
    const theUc = findUniqConstraints(uniqConstraints, foundEvaluator[4])

    for (let failedOnce = false, i = 0; i < valueCount; i++) {
      if (failedOnce) {
        break
      }

      let theValue = toSRToken([
        'value',
        vsName,
        vsSetIndex,
        valueId === star
          ? Math.floor(Math.random() * values.length)
          : valueId,
      ])

      if (theUc) {
        let countIdx = 0
        const countIdxMax = 100

        while (theUc.includes(theValue) && countIdx < countIdxMax) {
          theValue = toSRToken([
            'value',
            vsName,
            vsSetIndex.toString(),
            Math.floor(Math.random() * values.length).toString(),
          ])

          if (valueId === star) {
            countIdx++
          }
          else {
            countIdx = countIdxMax
          }
        }

        if (countIdx === countIdxMax) {
          theValue = null
          failedOnce = true
        }

        else {
          theUc.values.push(theValue)
        }
      }

      if (typeof theValue === 'string') {
        resolvedValues.push(theValue)
      }
    }
  }

  return resolvedValues
}
