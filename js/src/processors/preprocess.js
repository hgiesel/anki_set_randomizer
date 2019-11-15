import {
  vsNone, vsSome, vsStar, vsSelf,

  pickInt, pickReal,

  typeRel, typeAbs, typeAbsNeg, typeAll,

  typeAbsYank, typeAllYank, typeName,

  amountStar, amountCount,

  uniqSome, uniqCond, uniqNone, uniqAnon,
} from '../util.js'

import {
  namePatternRaw,
} from './util.js'

import {
  simpleStringToList,
  getBool,
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
    return {
      'type': typeAbs,
      'values': Number(abs),
    }
  }

  else if (absNeg) {
    return {
      'type': typeAbsNeg,
      'values': Number(absNeg),
    }
  }

  else if (all) {
    return {
      'type': typeAll,
      'values': null,
    }
  }

  else if (absYank) {
    return {
      'type': typeAbsYank,
      'values': Number(absYank),
    }
  }

  else if (allYank) {
    return {
      'type': typeAllYank,
      'values': null,
    }
  }

  else if (name) {
    return {
      'type': typeName,
      'values': name.split(':'),
    }
  }

  else /* rel */ {
    return {
      'type': typeRel,
      'values': Number(rel) || 0,
    }
  }
}

export const preprocessForce = function(options) {
  if (options.hasOwnProperty('force')) {
    switch (typeof options.force) {
      case 'string':
        const maybeBool = getBool(options.force)
        if (maybeBool !== null) {
          return {
            force: maybeBool,
          }
        }
        break

      case 'bool':
        return {
          force: options.force
        }

      default:
        // fallthrough
    }
  }

  return {
    force: false
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
      return {
        'type': vsSome,
        'name': vsSelf,
        'sub': vsSelf,
        'pos': vsSelf,
      }
    }

    return {
      'type': vsSome,
      'name': vsName === '*'
        ? vsStar
        : vsName === '_'
        ? vsSelf
        : vsName,
      'sub': !Number.isNaN(maybeVsSub)
        ? maybeVsSub
        : vsSubIndex === '_'
        ? vsSelf
        : vsStar /* default */,
      'pos': !Number.isNaN(maybeVsPos)
        ? maybeVsPos
        : vsPosIndex === '_'
        ? vsSelf
        : vsStar /* default */,
    }
  }

  return {
    'type': vsNone,
    'name': null,
    'sub': null,
    'pos': null,
  }
}

export const preprocessAmount = function(amountText, defaultAmount = 1) {
  if (amountText === '*' || (!amountText && defaultAmount === amountStar)) {
    return {
      'type': amountStar,
      'value': null,
    }
  }

  const amountNumber = Number(amountText)
  return {
    'type': amountCount,
    'value': Number.isNaN(amountNumber) ? defaultAmount : amountNumber,
  }
}

const parseUniqConditions = function(cond, add, fail) {
  let condJsonParsed = null
  try {
    condJsonParsed = JSON.parse(cond)
  }
  catch (e) {
    return {
      'type': uniqNone,
      'name': null,
    }
  }

  const addResult = add
    ? simpleStringToList(add)
    : []

  const failResult = fail
    ? simpleStringToList(fail)
    : []

  return {
    'type': uniqCond,
    'cond': condJsonParsed,
    'add': addResult,
    'fail': failResult,
  }
}

export const preprocessUniq = function(options, shortcut = false) {
  if (options.hasOwnProperty('cond')
    || options.hasOwnProperty('add')
    || options.hasOwnProperty('fail')
  ) {
    if (shortcut) {
      return {
        'type': uniqCond,
        'cond': options.cond || [],
        'add': options.add || [],
        'fail': options.fail || [],
      }
    }
    else {
      return parseUniqConditions(options.cond, options.add, options.fail)
    }
  }

  else if (options.hasOwnProperty('uniq')) {
    if (typeof options.uniq === 'string') {
      const realName = options.uniq.match(namePatternRaw)

      if (realName) {
        return {
          'type': uniqSome,
          'name': realName[0],
        }
      }
    }

    else {
      return {
        'type': uniqAnon,
        'name': null,
      }
    }
  }

  return {
    'type': uniqNone,
    'name': null,
  }
}

export const preprocessPickNumber = function([minValue, maxValue, extraValue]) {
  if (minValue.includes('.') || maxValue.includes('.')) {
    return {
      'type': pickReal,
      'min': Number(minValue),
      'max': Number(maxValue),
      'extra': Number(extraValue) || 2,
    }
  }

  return {
    'type': pickInt,
    'min': Number(minValue),
    'max': Number(maxValue),
    'extra': Number(extraValue) || 1,
  }
}

export const preprocessPick = function([minValue, maxValue, extraValue, ...vsArgs]) {
  if (typeof minValue === 'string') {
    return preprocessPickNumber([minValue, maxValue, extraValue])
  }

  return preprocessVs(vsArgs, true)
}
