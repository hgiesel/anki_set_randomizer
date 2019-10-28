import {
  keywordRegex,
} from '../processors/util.js'

export function getBool(attributeValue) {
  const bool = attributeValue === 'true' || attributeValue === 'yes'
    ? true
    : attributeValue === 'false' || attributeValue === 'no'
    ? false
    : null

  return bool
}

export function partitionList(list, spacing) {
    const output = []

    for (let i = 0; i < list.length; i += spacing) {
        output[output.length] = list.slice(i, i + spacing)
    }

    return output
}

// evaluates named set args in $n(), $o(), or $a()
export function getCorrespondingSets(
  numberedSets,
  namedSets,
  absolutePos,
  absolutePosFromEnd,
  currentPos,
  relativePos,
  otherNamedSet,
  otherNamedSetPos,
) {
  let correspondingSets

  if (absolutePos) {
    correspondingSets = [Number(absolutePos)]
  }
  else if (absolutePosFromEnd) {
    const offset = Number(absolutePosFromEnd.slice(1))
    correspondingSets = [numberedSets.elements.length + offset - 1]
  }
  else if (relativePos) {
    const idx = currentPos + Number(relativePos)

    correspondingSets = numberedSets.elements[idx]
      ? [idx]
      : []
  }
  else if (otherNamedSet) {
    const foundSets = namedSets
      .find(v => v.name === otherNamedSet)

    const finalSets = foundSets
      ? foundSets.sets
      : []

    if (foundSets && otherNamedSetPos) {
      const idx = Number(otherNamedSetPos) >= 0
        ? Number(otherNamedSetPos)
        : numberedSets.length + Number(otherNamedSetPos) - 1

      correspondingSets = finalSets[idx] >= 0
        ? [finalSets[idx]]
        : []

    }
    else {
      correspondingSets = finalSets
    }
  }
  else /* self-referential */ {
    correspondingSets = [currentPos]
  }

  return correspondingSets
}

export function evalKeywordArguments(keywordArguments) {

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

export function toOptArg(keywords) {
  const result = {}

  evalKeywordArguments(keywords)
    .forEach(kw => result[kw[0]] = kw[1])

  return result
}
