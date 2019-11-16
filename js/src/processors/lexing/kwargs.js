import {
  catchPattern,
} from './util.js'

const singleQuotePattern = /\\\\'/u
const doubleQuotePattern = /\\\\"/u

const evalKwargComponents = function(comp) {
  if (comp) {
    if (comp[2] || comp[5]) {
      return [comp[1], comp[2] || comp[5]]
    }

    else if (comp[3]) {
      return [
        comp[1],
        comp[3]
          .replace(singleQuotePattern, '\'')
          .replace(catchPattern, x => x.slice(1))
      ]
    }

    else if (comp[4]) {
      return [
        comp[1],
        comp[4]
          .replace(doubleQuotePattern, '\'')
          .replace(catchPattern, x => x.slice(1))
      ]
    }

    else {
      return [comp[1], true]
    }
  }

  else {
    return null
  }
}

const toKwargDict = function(keywords) {
  const result = {}
  keywords.forEach(kw => result[kw[0]] = kw[1])
  return result
}

const keywordPattern = (
  `(\\w+)` /* the keyword */
  + `(?:=(?:`
  + `"(.*?[^\\\\])"|` /* double quote notation */
  + `'(.*?[^\\\\])'|` /* single quote notation */
  + `(\\[.*?\\])(?=\\s*,\\s*\\w+|\\s*$)|` /* list notation */
  + `([^, ]+)` /* no-comma notation */
  + `)?)?`
)

const matchKwargs = function(text) {
  const kwargPattern = new RegExp(keywordPattern, 'gu')
  const result = []

  let match = null

  while (match = kwargPattern.exec(text)) {
    result.push(match)
  }

  return result
}

export const kwargs = function(text) {
  if (text) {
    const result = toKwargDict(matchKwargs(text)
      .map(components => evalKwargComponents(components))
    )

    return result
  }

  else {
    return {}
  }
}

export const getBool = function(attributeValue) {
  const bool = attributeValue === 'true' || attributeValue === 'yes'
    ? true
    : attributeValue === 'false' || attributeValue === 'no'
    ? false
    : null

  return bool
}

export const partitionList = function(list, spacing = 1, drop = false) {
  const output = []

  for (let i = 0; i < list.length; i += spacing) {
    const partition = list.slice(i, i + spacing)

    if (!drop || partition.length === spacing) {
      output[output.length] = partition
    }
  }

  return output
}

export const simpleStringToList = function(string) {
  // e.g. for style colors, uniqCond add/fail
  if (typeof string === 'boolean') {
    return ''
  }

  else if (string[0] === '[' && string[string.length - 1] === ']') {
    return string
      .slice(1, -1)
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0)
  }

  else {
    return [string.trim()]
  }
}

