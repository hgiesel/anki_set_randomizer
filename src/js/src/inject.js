const tags = '{{Tags}}'.split(' ')
const cardType = '{{Card}}'

export function parseInjections(injections, iterIds) {

  const result = iterIds.map(iter => {

    function parseConditions(condition) {
      switch (condition[0]) {
        case 'card':
          return condition[1] === '='
          ? cardType === condition[2]
          : condition[1] === '!='
            ? cardType !== condition[2]
            : cardType[condition[1]](condition[2])

        case 'tag':
          return tags.map(v =>
            condition[1] === '='
            ? v === condition[2]
            : condition[1] === '!='
              ? v !== condition[2]
              : v[condition[1]](condition[2]))
          .reduce((accu, v) => accu || v, false)

        case 'iter':
          return condition[1] === '='
          ? iter === condition[2]
          : condition[1] === '!='
            ? iter !== condition[2]
            : iter[condition[1]](condition[2])

        case '&':
          return condition.slice(1).map(v => parseConditions(v)).reduce((accu, v) => accu && v)

        case '|':
          return condition.slice(1).map(v => parseConditions(v)).reduce((accu, v) => accu || v)
      }
    }

    function parseInjection(found, injection) {
      return parseConditions(injection.conditions)
        ? (found.push(injection.statements), found)
        : found
    }

    return injections.reduce(parseInjection, []).map(v => (v.push('$apply(meta)'), v))
  })

  return result
}
