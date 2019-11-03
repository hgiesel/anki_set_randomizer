import {
  keywordRegex,
} from '../processors/util.js'

import {
  typeRel,
  typeAbs,
  typeAbsNeg,
  typeName,
} from '../util.js'

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


const analyzeName = function(numberedSets, namedSets, [name1, name2]) {
  const foundSets = namedSets
    .find(v => v.name === name1)

  if (!foundSets) {
    return [name1 /* assume yank group */]
  }

  else if (foundSets && name2) {
    const namedPos = Number(name2)

    const idx = namedPos >= 0
      ? namedPos
      : numberedSets.length + namedPos - 1

    return foundSets.sets[idx] >= 0
      ? [foundSets.sets[idx]]
      : []
  }

  else {
    return foundSets.sets
  }
}

// evaluates named set args in $n(), $o(), or $a()
export const getCorrespondingSets = function(
  numberedSets,
  namedSets,

  name,
  currentPos,
) {
  switch (name.type) {
    case typeRel:
      return [currentPos + name.values]

    case typeAbs:
      return [name.values]

    case typeAbsNeg:
      return [numberedSets.length + name.values - 1]

    case typeName: default:
      return analyzeName(numberedSets, namedSets, name.values)
  }
}

export const evalKeywordArguments = function(keywordArguments) {
  const result = []
  let m = keywordRegex.exec(keywordArguments)

  while (m) {
    result.push([
      m[1],
      m[2] || m[3] || m[4] || m[5] || ''
    ])

    m = keywordRegex.exec(keywordArguments)
  }

  return result
}

export const toOptArg = function(keywords) {
  const result = {}
  console.log('mekeke', keywords)

  keywords
    .forEach(kw => result[kw[0]] = kw[1])

  return result
}
