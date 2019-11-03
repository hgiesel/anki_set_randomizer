import {
  vsNothing,
  vsJust,
  vsStar,

  pickInt,
  pickReal,

  typeRel,
  typeAbs,
  typeAbsNeg,
  typeName,

  amountStar,
  amountCount,

  uniqJust,
  uniqNothing,
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

export const preprocessName = function([abs, absNeg, rel, name]) {
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
    return {
      'type': vsJust,
      'name': vsName === '*' ? vsStar : vsName,
      'sub': vsSubIndex === '*' ? vsStar : Number(vsSubIndex),
      'pos': vsPosIndex === '*' ? vsStar : Number(vsPosIndex),
    }
  }

  return {
    'type': vsNothing,
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

export const preprocessUniq = function([uniqName]) {
  if (typeof uniqName === 'string') {
    if (uniqName.length === 0) {
      return {
        'type': uniqAnon,
        'name': null,
      }
    }

    return {
      'type': uniqJust,
      'name': uniqName,
    }
  }

  return {
    'type': uniqNothing,
    'name': null,
  }
}

export const preprocessPick = function([minValue, maxValue, extraValue, ...vsArgs]) {
  if (typeof minValue === 'string') {
    if (minValue.includes('.') || maxValue.includes('.')) {
      return {
        'type': pickInt,
        'min': Number(minValue),
        'max': Number(maxValue),
        'extra': Number(extraValue) || 1,
      }
    }

    return {
      'type': pickReal,
      'min': Number(minValue),
      'max': Number(maxValue),
      'extra': Number(extraValue) || 2,
    }
  }

  return preprocessVs(vsArgs)
}
