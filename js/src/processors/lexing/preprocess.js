import {
  vs, pick, pos, amount, uniq, rule, tag,
} from '../../types.js'

import {
  namePatternRaw,
} from './grammar/patterns.js'

import {
  simpleStringToList,
} from './kwargs.js'

export const preprocessYank = function([
  imageId,
  yankGroup,
  shapeType,
  dimensionValues,
  textContent,
]) {
  return [
    imageId
      ? Number(imageId)
      : 0,
    yankGroup,
    shapeType,
    dimensionValues.split(':').map(val => Number(val)),
    textContent || ''
  ]
}

export const preprocessNamepos = function([abs, absNeg, rel, all, absYank, allYank, name]) {
  if (abs) {
    return tag(pos.abs, Number(abs))
  }

  else if (absNeg) {
    return tag(pos.absNeg, Number(absNeg))
  }

  else if (all) {
    return tag(pos.all)
  }

  else if (absYank) {
    return tag(pos.absYank, Number(absYank))
  }

  else if (allYank) {
    return tag(pos.allYank)
  }

  else if (name) {
    return tag(pos.name, name.split(':'))
  }

  else /* rel */ {
    return tag(pos.rel, Number(rel) || 0)
  }
}

export const preprocessVs = function(
  [vsName, vsSubIndex, vsPosIndex],
  noSelf = false /* only makes sense in uniqCond */
) {
  if (vsName
    && (!noSelf || (vsName !== '_' && vsName !== '$' && vsSubIndex !== '_' && vsPosIndex !== '_'))
  ) {
    const maybeVsSub = Number(vsSubIndex)
    const maybeVsPos = Number(vsPosIndex)

    if (vsName === '$') {
      return tag(vs.some, {
        'name': vs.self,
        'sub': vs.self,
        'pos': vs.self,
      })
    }

    return tag(vs.some, {
      'name': vsName === '*'
        ? vs.star
        : vsName === '_'
        ? vs.self
        : vsName,
      'sub': !Number.isNaN(maybeVsSub)
        ? maybeVsSub
        : vsSubIndex === '_'
        ? vs.self
        : vs.star /* default */,
      'pos': !Number.isNaN(maybeVsPos)
        ? maybeVsPos
        : vsPosIndex === '_'
        ? vs.self
        : vs.star /* default */,
    })
  }

  return tag(vs.none)
}

export const preprocessAmount = function(amountText, defaultAmount = 1) {
  if (amountText === '*' || (!amountText && defaultAmount === amount.star)) {
    return tag(amount.star)
  }

  else if (amountText === '+' || (!amountText && defaultAmount === amount.plus)) {
    return tag(amount.plus)
  }

  else if (amountText === '?' || (!amountText && defaultAmount === amount.question)) {
    return tag(amount.question)
  }

  const amountNumber = Number(amountText)
  return tag(amount.count, Number.isNaN(amountNumber)
    ? defaultAmount
    : amountNumber
  )
}

const parseUniqConditions = function(cond, add, fail, uniqVal) {
  let condResult = null
  if (cond) {
    try {
      condResult = JSON.parse(cond)
    }
    catch (e) {
      return tag(uniq.none)
    }
  }
  else {
    condResult = []
  }

  const addResult = add
    ? simpleStringToList(add)
    : []

  const failResult = fail
    ? simpleStringToList(fail)
    : []

  return tag(uniq.cond, {
    'cond': condResult,
    'add': addResult,
    'fail': failResult,
    'name': uniqVal ? uniqVal : null,
  })
}

const parseUniqName = function(name) {
  return typeof name === 'string'
    ? name.match(namePatternRaw)[0]
    : `_anonymous${String(Math.random()).slice(2)}`
}

export const preprocessUniq = function(options) {
  if (options.hasOwnProperty('cond')
    || options.hasOwnProperty('add')
    || options.hasOwnProperty('fail')
  ) {
    return parseUniqConditions(
      options.cond,
      options.add,
      options.fail,
      options.uniq,
    )
  }

  else if (options.hasOwnProperty('uniq')) {
    return tag(uniq.some, parseUniqName(options.uniq))
  }

  else {
    return tag(uniq.none)
  }
}

export const preprocessPickInt = function([minValue, maxValue, extraValue]) {
  return tag(pick.int, {
    'min': Number(minValue),
    'max': Number(maxValue),
    'extra': Number(extraValue) || 1,
  })
}

export const preprocessPickReal = function([minValue, maxValue, extraValue]) {
  return tag(pick.real, {
    'min': Number(minValue),
    'max': Number(maxValue),
    'extra': Number(extraValue) || 2,
  })
}

export const preprocessPickNumber = function([minValue, maxValue, extraValue]) {
  return minValue.includes('.') || maxValue.includes('.')
    ? preprocessPickReal([minValue, maxValue, extraValue || 2])
    : preprocessPickInt([minValue, maxValue, extraValue || 1])
}

export const preprocessPick = function([minValue, maxValue, extraValue, ...vsArgs]) {
  if (typeof minValue === 'string') {
    return preprocessPickNumber([minValue, maxValue, extraValue])
  }

  return tag(pick.vs, preprocessVs(vsArgs, true))
}

export const preprocessRule = function([
  vsName,
  vsSubIndex,
  vsPosIndex,
  ucName,
]) {
  if (ucName) {
    return tag(rule.uniq, preprocessUniq({
      uniq: ucName,
    }))
  }

  if (vsName) {
    return tag(rule.vs, preprocessVs([vsName, vsSubIndex, vsPosIndex], false))
  }

  else {
    return tag(rule.none)
  }
}
