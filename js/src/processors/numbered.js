////////////////////
// First Processing, returns SRTokens

import {
  pickInt, pickReal,
  uniqSome, uniqCond,
  amountCount, amountPlus, amountQuestion,
  toSRToken,

  vsSerialize,
} from '../util.js'

import {
  newLinePattern,
  catchPattern,
} from './util.js'

export const processValueSet = function(
  valueSets,
  iterName, setIndex, elemIndex,

  vsName,
  valueSeparator,
  valueString
) {
  const values = valueString
    .replace(`\\${valueSeparator}`, toSRToken(['escdelim']))
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, x => x.slice(1))
    .split(valueSeparator)
    .map(v => v.replace(toSRToken(['escdelim']), valueSeparator))

  const vsSub = (valueSets[vsName] || (valueSets[vsName] = [])).push({
    name: vsName,
    sub: valueSets[vsName]
      ? valueSets[vsName].length
      : 0,
    values: values,
  }) - 1

  return toSRToken(['vs', vsName, vsSub])
}

export const processPick = function(amount, pick, uniq) {
  const uniqString = uniq.type === uniqSome
    ? `uniq=${uniq.name}`
    : uniq.type === uniqCond
    ? `cond=${JSON.stringify(uniq.cond)},add=${JSON.stringify(uniq.add)},fail=${JSON.stringify(uniq.fail)}`
    : ''

  const amountText = amount.type === amountCount
    ? String(amount.value)
    : amount.type === amountPlus
    ? '+'
    : amount.type === amountQuestion
    ? '?'
    // : amount.type === amountStar
    : '*'


  switch (pick.type) {
    case pickInt:
      return toSRToken([
        'pick:number',
        amountText,
        pick.min,
        pick.max,
        pick.extra || '1',
        uniqString,
      ])

    case pickReal:
      return toSRToken([
        'pick:number',
        amountText,
        pick.min,
        pick.max,
        pick.extra || '2',
        uniqString,
      ])

    default /* vs */:
      return toSRToken([
        'pick:vs',
        amountText,
        vsSerialize(pick.name),
        vsSerialize(pick.sub),
        vsSerialize(pick.pos),
        uniqString,
      ])
  }
}
