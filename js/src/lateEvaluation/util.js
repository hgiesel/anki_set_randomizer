import {
  keywordRegex,
} from '../processors/util.js'

import {
  typeRel,
  typeAbs,
  typeAbsNeg,
  typeAll,

  typeAbsYank,
  typeAllYank,
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

const analyzeName = function(elements, yanks, namedSets, [name1, name2, name3, name4], allowYanks = true) {
  const foundSets = namedSets
    .find(v => v.name === name1)

  if (foundSets && name2) {
    const namedPos = Number(name2)

    const idx = namedPos >= 0
      ? namedPos
      : elements.length + namedPos - 1

    return foundSets.sets[idx] >= 0
      ? [foundSets.sets[idx]]
      : []
  }

  else if (foundSets) {
    return foundSets.sets
  }

  else if (!allowYanks) {
    return []
  }

  else /* !foundSets => look for yanks */ {
    let foundYanks = []

    if (name1 === 'img') /* img:imageid:yankgroup:count */ {
      foundYanks = yanks

      if (name2) {
        foundYanks = foundYanks.filter(([/*yankid */, imageid]) => imageid === Number(name2))

        if (name3 && Number.isNaN(Number(name3))) {
          foundYanks = foundYanks.filter(([/*yankid */, /* imageid */, yankname]) => yankname === name3)

          if (name4) {
            const aYank = foundYanks[name4]
            foundYanks = aYank ? [aYank] : []
          }
        }

        else if (name3) {
          const aYank = foundYanks[name3]
          foundYanks = aYank ? [aYank] : []
        }
      }
    }

    else /* yankgroup:count */ {
      foundYanks = yanks.filter(([/* yankid */, /* imageid */, yankname]) => yankname === name1)

      if (name2) {
        const aYank = foundYanks[name2]
        foundYanks = aYank ? [aYank] : []
      }
    }

    const result = foundYanks.map(([yankid /*, ... */]) => `_${yankid}`)
    return result
  }
}

// evaluates named set args in $n(), $o(), or $a()
export const getCorrespondingSets = function(
  elements,
  namedSets,
  yanks,

  name,
  currentPos,

  evalNames = true,
  allowYanks = true,
) {
  switch (name.type) {
    /* returns [number] */
    case typeRel:
      return [currentPos + name.values]

    case typeAbs:
      return [name.values]

    case typeAbsNeg:
      return [elements.length + name.values - 1]

    case typeAll:
      return [...elements.keys()]

    /* returns [string] */
    case typeAbsYank:
      return allowYanks
        ? [`_${name.values}`]
        : []

    case typeAllYank:
      return allowYanks
        ? yanks.map(([yankid /*, ... */]) => `_${yankid}`)
        : []

    case typeName: default:
      return evalNames
        ? analyzeName(elements, yanks, namedSets, name.values)
        : name.name
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

const toOptArg = function(keywords) {
  const result = {}

  keywords
    .forEach(kw => result[kw[0]] = kw[1])

  return result
}

export const keywordProcess = function(kwArgs) {
  return toOptArg(evalKeywordArguments(kwArgs))
}
