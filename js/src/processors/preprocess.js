import {
  vsNone,
  vsSome,
  vsStar,

  pickInt,
  pickReal,

  typeRel,
  typeAbs,
  typeAbsNeg,
  typeAll,

  typeAbsYank,
  typeAllYank,

  typeName,

  amountStar,
  amountCount,

  uniqSome,
  uniqCond,
  uniqNone,
  uniqAnon,
} from '../util.js'

import {
  namePatternRaw,
} from './util.js'

import {
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

export const preprocessVs = function([vsName, vsSubIndex, vsPosIndex]) {
  if (vsName) {
    const maybeVsSub = Number(vsSubIndex)
    const maybeVsPos = Number(vsPosIndex)

    return {
      'type': vsSome,
      'name': vsName === '*' ? vsStar : vsName,
      'sub': Number.isNaN(maybeVsSub) ? vsStar : maybeVsSub,
      'pos': Number.isNaN(maybeVsPos) ? vsStar : maybeVsPos,
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

  return {
    'type': amountCount,
    'value': Number(amountText) || defaultAmount,
  }
}

const parseUniqConditions = function(cond, add, fail) {
  return {
    'type': uniqCond,
    'cond': cond,
    'add': add,
    'fail': fail,
  }
}

export const preprocessUniq = function(options, shortcut = false) {
  if (options.hasOwnProperty('cond')) {
    if (shortcut) {
      return 'foo'
    }
    else {
      parseUniqConditions(options.cond, options.add, options.fail)
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

  return preprocessVs(vsArgs)
}
