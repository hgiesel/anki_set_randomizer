import {
  elemVs,
  elemPick,
} from '../util.js'

import {
  newLinePattern,
  catchPattern,
} from './util.js'

const unescapeSeparator = function(token, dropFirst = true) {
  return token
    .split('%%')
    .slice(dropFirst ? 3 : 2, -1)
}

const escapeSeparator = function(components) {
  return `%%sr%%${components.join('%%')}%%`
}

export const processValueSet = function(
  valueSets,
  iterName, setIndex, elemIndex,

  vsName,
  valueSeparator,
  valueString
) {
  const values = valueString
    .replace(`\\${valueSeparator}`, escapeSeparator(['escdelim']))
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, x => x.slice(1))
    .split(valueSeparator)
    .map(v => v.replace(unescapeSeparator(['escdelim']), valueSeparator))

  const vsSub = (valueSets[vsName] || (valueSets[vsName] = [])).push({
    name: vsName,
    sub: valueSets[vsName]
      ? valueSets[vsName].length
      : 0,
    values: values,
  }) - 1

  return {
    type: elemVs,
    name: vsName,
    sub: vsSub,
  }
}

export const processPick = function(amount, pick, uniq) {
  return {
    type: elemPick,
    content: {
      amount: amount,
      pick: pick,
      uniq: uniq,
    }
  }
}
