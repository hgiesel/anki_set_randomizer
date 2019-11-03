import {
  keywordRegex,
} from '../processors/util.js'

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

// evaluates named set args in $n(), $o(), or $a()
export const getCorrespondingSets = function(
  numberedSets,
  namedSets,
  absolutePos,
  absolutePosFromEnd,
  currentPos,
  relativePos,
  nsOrYg,
  nsPos,
) {
  let correspondingSets = []

  if (absolutePos) {
    correspondingSets = [Number(absolutePos)]
  }

  else if (absolutePosFromEnd) {
    const offset = Number(absolutePosFromEnd)
    correspondingSets = [numberedSets.elements.length + offset - 1]
  }

  else if (relativePos) {
    const idx = currentPos + Number(relativePos)

    correspondingSets = numberedSets.elements[idx]
      ? [idx]
      : []
  }

  else if (nsOrYg) {
    const foundSets = namedSets
      .find(v => v.name === nsOrYg)

    if (!foundSets) {
      return [nsOrYg /* assume yank group */]
    }

    else if (foundSets && nsPos) {
      const idx = Number(nsPos) >= 0
        ? Number(nsPos)
        : numberedSets.length + Number(nsPos) - 1

      correspondingSets = foundSets.sets[idx] >= 0
        ? [foundSets.sets[idx]]
        : []
    }

    else {
      correspondingSets = foundSets.sets
    }
  }

  else /* self-referential */ {
    correspondingSets = [currentPos]
  }

  return correspondingSets
}

export const evalKeywordArguments = function(keywordArguments) {
  const result = []
  let m = keywordRegex.exec(keywordArguments)

  while (m) {
    const theValue = [
      m[1],
      m[2] !== undefined ? m[2] :
      m[3] !== undefined ? m[3] :
      m[4] !== undefined ? m[4] :
      m[5] !== undefined ? m[5] : '',
    ]

    result.push(theValue)
    m = keywordRegex.exec(keywordArguments)
  }

  return result
}

export const toOptArg = function(keywords) {
  const result = {}

  evalKeywordArguments(keywords)
    .forEach(kw => result[kw[0]] = kw[1])

  return result
}
