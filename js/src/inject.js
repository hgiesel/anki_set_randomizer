export const parseInjections = function(
  injections,
  iterNames,
  tags,
  cardType,
) {
  const result = iterNames.map((iter) => {
    const parseConditions = function(condition) {
      switch (condition[0]) {
        case 'card':
          return condition[1] === '='
            ? cardType === condition[2]
            : condition[1] === '!='
              ? cardType !== condition[2]
              : cardType[condition[1]](condition[2])

        case 'tag':
          return tags
            .map(v => (condition[1] === '='
              ? v === condition[2]
              : condition[1] === '!='
              ? v !== condition[2]
              : v[condition[1]](condition[2])
            ))
            .reduce((accu, v) => accu || v, false)

        case 'iter':
          return condition[1] === '='
            ? iter === condition[2]
            : condition[1] === '!='
            ? iter !== condition[2]
            : iter[condition[1]](condition[2])

        case '!':
          return !parseConditions(condition[1])

        case '&':
          return condition.slice(1).map(v => parseConditions(v)).reduce((accu, v) => accu && v)

        case '|':
          return condition.slice(1).map(v => parseConditions(v)).reduce((accu, v) => accu || v)

        default /* no conditions given */:
          return true
      }
    }

    const parseInjection = function(injection) {
      return parseConditions(injection.conditions)
        ? [injection.statements]
        : []
    }

    return injections.flatMap(parseInjection)
  })

  return result
}
