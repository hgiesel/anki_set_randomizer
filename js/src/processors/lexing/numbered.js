import {
  tag, elem,
} from '../../types.js'

import {
  newLinePattern,
  catchPattern,
} from './grammar/patterns.js'

const escdelim = '%%sr%%escdelim%%'

export const processValueSet = function(
  valueSets,
  iterName, setIndex, elemIndex,

  vsName,
  valueSeparator,
  valueString
) {
  const values = valueString
    .replace(`\\${valueSeparator}`, escdelim)
    .replace(newLinePattern, '<br/>')
    .replace(catchPattern, x => x.slice(1))
    .split(valueSeparator)
    .map(v => v.replace(escdelim, valueSeparator))

  const vsSub = (valueSets[vsName] || (valueSets[vsName] = [])).push({
    name: vsName,
    sub: valueSets[vsName]
      ? valueSets[vsName].length
      : 0,
    values: values,
  }) - 1

  return tag(elem.vs, {
    name: vsName,
    sub: vsSub,
  })
}

export const processPick = function(amount, pick, uniq) {
  return tag(elem.pick, {
    amount: amount,
    pick: pick,
    uniq: uniq,
  })
}
