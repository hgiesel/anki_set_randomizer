export default function lateEvaluate(
  re,

  namedSetStatements,
  orderStatements,
  commandStatements,

  applyStatements,
) {
  namedSetStatements
    .reduce((accu, elem) => {
      elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
        ? accu.push(elem)
        : accu.unshift(elem)
      return accu
    }, [])
    .forEach(stmt => re.processNamedSet(...stmt))

  orderStatements.forEach(stmt => re.processOrder(...stmt))
  commandStatements.forEach(stmt => re.processCommand(...stmt))
  applyStatements.forEach(stmt => re.processApplication(...stmt))
}
