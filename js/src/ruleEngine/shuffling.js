const getActual = function(name) {
  return name === '_'
    ? `_unnamed${Math.random().toString().slice(2)}`
    : name
}

export const processNamedSet = function(
  iterName, setIndex, posIndex, correspondingSets,

  shuffleName, options, namedSets,
) {
  const actualName = getActual(shuffleName)

  let helpNs = null
  const ns = (helpNs = namedSets.find(w => w.name === actualName))
    ? helpNs
    : namedSets[namedSets.push({
      iter: iterName,
      name: actualName,
      sets: [/* all strings */],
    }) - 1]

  ns.sets.push(...correspondingSets)
  ns.sets = [...new Set(ns.sets)].sort()

  return actualName
}

export const createDefaultNames = function(elements, iterName) {
  const namedSets = []
  elements.forEach((set, idx) => {
    if (set.length > 0) {
      processNamedSet(iterName, idx, 0, [idx], String(idx), {}, namedSets)
    }
  })

  return namedSets
}

export const processOrder = function(
  iterName, setIndex, posIndex, correspondingSets,

  orderName, options, orderConstraints, orderApplications, namedSets,
) {
  const actualOrderName = getActual(orderName)

  let theNames = null
  if (typeof correspondingSets[0] === 'number') {
    theNames = correspondingSets
      .map(set => processNamedSet(
        iterName, setIndex, posIndex, [set],
        String(set), options, namedSets
      ))
  }

  else {
    const maybeNs = namedSets.find(ns => ns.name === correspondingSets[0])
    theNames = maybeNs ? [maybeNs.name] : []
  }

  let theOc = null
  const oc = (theOc = orderConstraints.find(v => v.name === actualOrderName))
    ? theOc
    : orderConstraints[orderConstraints.push({
      iter: iterName,
      name: actualOrderName,
      sets: [/* only named sets allowed */],
    }) - 1]

  for (const stringName of theNames) {
    if (!oc.sets.includes(stringName)) {
      oc.sets.push(stringName)
    }

    orderApplications[stringName] = [actualOrderName]
  }

  return actualOrderName /* never really used */
}
