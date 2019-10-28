import ruleEngine from './ruleEngine'

export default function lateEvaluate(
  numberedSets,
  defaultStyle,

  namedSetStatements,
  commandStatements,
  styleStatements,
  applyStatements,
) {
  console.log('-1')

  const re = ruleEngine(numberedSets, defaultStyle)

  console.log('0', re.exportResults())

  namedSetStatements
    .reduce((accu, elem) => {
      elem[5] || elem[6] || elem[7] || elem[8] || elem[9]
        ? accu.push(elem)
        : accu.unshift(elem)
      return accu
    }, [])
    .forEach(stmt => re.processNamedSet(...stmt))

  console.log('1', re.exportResults())

  commandStatements.forEach(stmt => re.processCommand(...stmt))

  console.log('2', re.exportResults())

  styleStatements.forEach(stmt => re.processStyle(...stmt))

  console.log('3', re.exportResults())

  applyStatements.forEach(stmt => re.processApplication(...stmt))

  console.log('4', re.exportResults())

  return re.exportResults()
}
