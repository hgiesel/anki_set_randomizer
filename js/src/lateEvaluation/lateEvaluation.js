import ruleEngine from './ruleEngine'

export default function lateEvaluate(
  numberedSets,
  yanks,
  defaultStyle,

  namedSetStatements,
  orderStatements,
  commandStatements,

  styleStatements,
  applyStatements,
) {
  const re = ruleEngine(numberedSets, yanks, defaultStyle)

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
  styleStatements.forEach(stmt => re.processStyle(...stmt))
  applyStatements.forEach(stmt => re.processApplication(...stmt))

  return re.exportResults()
}
