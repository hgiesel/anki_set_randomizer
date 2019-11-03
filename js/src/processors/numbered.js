import {
  pickInt, pickReal,
  uniqAnon, uniqSome,
  amountCount,
  vsStar,

  toSRToken,
} from '../util.js'

const newLinePattern = /\\n/gu
const catchPattern = /\\./gu

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
  const uniqConstraintName = uniq.type === uniqAnon
    ? `_unnamed${String(Math.random()).slice(2)}`
    : uniq.type === uniqSome
    ? uniq.name
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
        uniqConstraintName,
      ])

    case pickReal:
      return toSRToken([
        'pick:number',
        amountText,
        pick.min,
        pick.max,
        pick.extra || '',
        uniqConstraintName,
      ])

    default /* vs */:
      return toSRToken([
        'pick:vs',
        amountText,
        pick.name === vsStar ? '*' : pick.name,
        pick.sub === vsStar ? '*' : pick.sub,
        pick.pos === vsStar ? '*' : pick.pos,
        uniqConstraintName,
      ])
  }
}
