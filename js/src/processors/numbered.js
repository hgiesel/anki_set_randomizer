import {
  namePattern,
  positionPattern,
} from './util.js'

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
  count, valueSetName,
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

    count >= 0
      ? Number(count)
      : 1,

    uniquenessConstraint,
  ]

  return result
}

const valueSetPattern = new RegExp(
  `^\\$(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
)

const newLinePattern = new RegExp(`\\\\n`, 'g')
const catchPattern = new RegExp(`\\\\.`, 'g')

export function processValueSet(
  valueSets, iterName, setIndex, elemIndex,
  valueSetName, valueSeparator, valueString
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
  countString,
  minValue, maxValue, extraValue,
  valueSetName,
  maybeValueSetIndexString, _setIndexStar,
  maybeValueSetPosIndexString, _posIndexStar,
  maybeUniqConstraintName,
) {

  const count = countString !== null
    ? Number(countString)
    : 1

  const uniqConstraintName = maybeUniqConstraintName || ''

  if (minValue && maxValue) {

    const extraValueString = extraValue || ''

    return toSRToken([
      'pick:number',
      count.toString(),
      minValue,
      maxValue,
      extraValueString,
      uniqConstraintName,
    ])
  }

  else {
    const maybeValueSetSetIndex = Number(maybeValueSetSetIndexString)
    const maybeValueSetPosIndex = Number(maybeValueSetPosIndexString)

    const valueSetSetIndex = !Number.isNaN(maybeValueSetSetIndex)
      ? maybeValueSetSetIndex
      : '*'

    const valueSetPosIndex = !Number.isNaN(maybeValueSetPosIndex)
      ? maybeValueSetPosIndex
      : '*'

    return toSRToken([
      'pick:vs',
      count.toString(),
      valueSetName,
      valueSetSetIndex,
      valueSetPosIndex,
      uniqConstraintName,
    ])
  }
}

export function evalPickNumber(
  uniqConstraints,
  count,
  minValue,
  maxValue,
  extraValue,
  uniqConstraintName
) {
  const theUc = findUniqConstraints(uniqConstraints, uniqConstraintName)
  const resultValues = []

  // generate a random integer or real number
  const isReal = minValue.includes('.') || maxValue.includes('.')

  for (let failedOnce = false, i = 0; i < count; i++) {
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
  count,
  valueSetName,
  valueSetSetIndex,
  valueSetPosIndex,
  uniqConstraintName,
) {

  const resultValues = []
  const theUc = findUniqConstraints(uniqConstraints, uniqConstraintName)

  for (let failedOnce = false, i = 0; i < count; i++) {
    if (failedOnce) {
      break;
    }

    const foundValueSet = valueSets[
      valueSetNameName === star
      ? Object.keys(valueSets)[Math.floor(Math.random() * Object.keys(valueSets).length)]
      : valueSetNameName
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
  valueSetName,
  valueSetIndex,
) {
  const values = valueSets[valueSetName][valueSetIndex].values
  console.log('v', values)

  const foundEvaluator = evaluators.find(v => (
    (v[0] === valueSetName && v[1] === valueSetIndex) ||
    (v[0] === valueSetName && v[1] === star) ||
    (v[0] === star && v[1] === valueSetIndex) ||
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
        valueSetName,
        valueSetIndex,
        valueId !== star ? valueId : Math.floor(Math.random() * values.length),
      ])

      if (theUc) {

        let countIdx = 0
        const countIdxMax = 100

        while (theUc.includes(theValue) && countIdx < countIdxMax) {

          theValue = toSRToken([
            'value',
            valueSetName,
            valueSetIndex.toString(),
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
