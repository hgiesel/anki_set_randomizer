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
