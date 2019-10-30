import {
  toSRToken,
} from '../util.js'

import {
  star,
} from '../util.js'

function generateRandomValue(min, max, extra, isReal) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

export function processEvaluator(
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

    !Number.isNaN(nsi)
      ? nsi
      : star,

    !Number.isNaN(nvi)
      ? nvi
      : star,

    amount >= 0
      ? Number(amount)
      : 1,

    uniquenessConstraint,
  ]

  return result
}

const newLinePattern = new RegExp(`\\\\n`, 'g')
const catchPattern = new RegExp(`\\\\.`, 'g')

export function processValueSet(
  valueSets,
  iterName, setIndex, elemIndex,

  valueSetName,
  valueSeparator,
  valueString
) {

  const values = valueString
    .replace(`\\${valueSeparator}`, toSRToken(['escdelim']))
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, (x) => x.slice(1))
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

export function processPick(
  amountString,
  minValue, maxValue, extraValue,
  vsName,
  maybeVsSetIndex, _vssIndexStar,
  maybeVsValueIndex, _vsvIndexStar,
  maybeUniqConstraintName,
) {

  const amount = amountString !== null
    ? amountString // star or number
    : '1'

  const uniqConstraintName = maybeUniqConstraintName === undefined
    ? ''
    : maybeUniqConstraintName === ''
      ? `_unnamed${Math.random().toString().slice(2)}`
      : maybeUniqConstraintName

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
    const vsSetIndex = !Number.isNaN(Number(maybeVsSetIndex))
      ? maybeVsSetIndex
      : '*'

    const vsValueIndex = !Number.isNaN(Number(maybeVsValueIndex))
      ? maybeVsValueIndex
      : '*'

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

export function evalPickNumber(
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

export function evalPickValueSet(
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
      break;
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
        : toSRToken(['value', foundValueSubSet.name, vidx, valueSetValueIndex])
      : null

    /* dealing with uc */
    if (resultValue && theUc) {
      let countIdx = 0
      const countIdxMax = 100

      while (theUc.values.includes(resultValue) && countIdx < countIdxMax) {

        const resultValue = foundValueSubSet
          ? valueSetSetIndex === star
            ? toSRToken(['value', foundValueSubSet.name, vidx, Math.floor(Math.random() * foundValueSubSet.values.length)])
            : toSRToken(['value', foundValueSubSet.name, vidx, valueSetValueIndex])
          : null

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

export function evalValueSet(
  uniqConstraints,
  valueSets,
  evaluators,
  vsName,
  vsSetIndex,
) {
  const values = valueSets[vsName][vsSetIndex].values
  console.log('v', values)

  const foundEvaluator = evaluators.find(v => (
    (v[0] === vsName && v[1] === vsSetIndex) ||
    (v[0] === vsName && v[1] === star) ||
    (v[0] === star && v[1] === vsSetIndex) ||
    (v[0] === star && v[1] === star) && (v[2] === star || v[2] < values.length)
  ))

  const resolvedValues = []
  let wasStar

  if (foundEvaluator) {

    wasStar = foundEvaluator[2] === star ? true : false

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
        valueId !== star ? valueId : Math.floor(Math.random() * values.length),
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

          if (valueId !== star) {
            countIdx = countIdxMax
          }
          else {
            countIdx++
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

      if (theValue !== null && theValue !== undefined) {
        resolvedValues.push(theValue)
      }
    }
  }

  return resolvedValues
}

function findUniqConstraints(uniqConstraints, uniqConstraintName) {
  return uniqConstraintName
      ? uniqConstraints.find(v => v.name === uniqConstraint) ||
      uniqConstraints[uniqConstraints.push({
        name: uniqConstraintName,
        values: []
      }) - 1]
      : null
}
