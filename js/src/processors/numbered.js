////////////////////
// First Processing, returns SRTokens

import {
  pickInt, pickReal,
  uniqAnon, uniqSome, uniqCond,
  amountCount,
  vsStar,

  toSRToken,
} from '../util.js'

import {
  newLinePattern,
  catchPattern,
} from './util.js'

export const processValueSet = function(
  valueSets,
  iterName, setIndex, elemIndex,

  valueSetName,
  valueSeparator,
  valueString
) {
  const values = valueString
    .replace(`\\${valueSeparator}`, toSRToken(['escdelim']))
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, x => x.slice(1))
    .split(valueSeparator)
    .map(v => v.replace(toSRToken(['escdelim']), valueSeparator))

  const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
    name: valueSetName,
    sub: valueSets[valueSetName]
      ? valueSets[valueSetName].length
      : 0,
    values: values,
  }) - 1

  return toSRToken(['vs', valueSetName, valueSetIndex])
}

export const processPick = function(amount, pick, uniq) {
  const uniqString = uniq.type === uniqAnon
    ? `uniq=_unnamed${String(Math.random()).slice(2)}`
    : uniq.type === uniqSome
    ? `uniq=${uniq.name}`
    : uniq.type === uniqCond
    ? `cond=${uniq.cond},add=${uniq.add},fail=${uniq.fail}`
    : ''


  const amountText = amount.type === amountCount
    ? String(amount.value)
    : '*'

  switch (pick.type) {
    case pickInt:
      return toSRToken([
        'pick:number',
        amountText,
        pick.min,
        pick.max,
        pick.extra || '',
        uniqString,
      ])

    case pickReal:
      return toSRToken([
        'pick:number',
        amountText,
        pick.min,
        pick.max,
        pick.extra || '',
        uniqString,
      ])

    default /* vs */:
      return toSRToken([
        'pick:vs',
        amountText,
        pick.name === vsStar ? '*' : pick.name,
        pick.sub === vsStar ? '*' : pick.sub,
        pick.pos === vsStar ? '*' : pick.pos,
        uniqString,
      ])
  }
}
