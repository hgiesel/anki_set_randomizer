import {
  vsNone,
  vsSome,
  vsStar,

  pickInt,
  pickReal,

  typeRel,
  typeAbs,
  typeAbsNeg,
  typeName,

  amountStar,
  amountCount,

  uniqSome,
  uniqNone,
  uniqAnon,
} from '../util.js'

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

export const preprocessNamepos = function([abs, absNeg, rel, name]) {
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

export const preprocessAmount = function([amountText], defaultAmount = 1) {
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

export const preprocessUniq = function([uniqKeyword, uniqName]) {
  if (uniqName) {
    return {
      'type': uniqSome,
      'name': uniqName,
    }
  }

  else if (uniqKeyword) {
    return {
      'type': uniqAnon,
      'name': null,
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
