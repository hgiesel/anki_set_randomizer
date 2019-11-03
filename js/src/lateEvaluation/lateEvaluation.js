import ruleEngine from './ruleEngine'

export default function lateEvaluate(
  numberedSets,
  defaultStyle,

  namedSetStatements,
  commandStatements,
  styleStatements,
  applyStatements,
) {
  const re = ruleEngine(numberedSets, defaultStyle)

  namedSetStatements
    .reduce((accu, elem) => {
      elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
        ? accu.push(elem)
        : accu.unshift(elem)
      return accu
    }, [])
    .forEach(stmt => re.processNamedSet(...stmt))

  console.log('le0', namedSetStatements)
  console.log('le1', commandStatements)
  console.log('le2', styleStatements)
  console.log('le3', applyStatements)

  commandStatements.forEach(stmt => re.processCommand(...stmt))

  styleStatements.forEach(stmt => re.processStyle(...stmt))

  applyStatements.forEach(stmt => re.processApplication(...stmt))

  return re.exportResults()
}
