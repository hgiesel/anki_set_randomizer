export const elem = {
  text: 'elemText',
  vs: 'elemVs',
  pick: 'elemPick',
  value: 'elemValue',
}

export const vs = {
  some: 'vsSome',
  none: 'vsNone',
  star: 'vsStar',
  self: 'vsSelf',
}

export const pos = {
  abs: 'posAbs',
  absNeg: 'posAbsNeg',
  absYank: 'posAbsYank',
  rel: 'posReal',

  all: 'posAll',
  allYank: 'posAllYank',

  name: 'posName',
}

export const amount = {
  count: 'amountCount',
  star: 'amountStar',
  plus: 'amountPlus',
  question: 'amountQuestion',
}

export const uniq = {
  some: 'uniqSome',
  cond: 'uniqCond',
  none: 'uniqNone',
}

export const pick = {
  int: 'pickInt',
  real: 'pickReal',
  vs: 'pickVs',
}

export const rule = {
  vs: 'ruleVs',
  uniq: 'ruleUniq',
  none: 'ruleNone',
}

export const tag = function(typeName, data = null) {
  return data
    ? {
      type: typeName,
      data: data,
    }
    : { type: typeName }
}

export const extract = data => data.data
