import {
  getData,
  saveData,
} from './save.js'

import {
  createWarnings,
} from './util.js'

import {
  parseInjections,
} from './inject.js'

import {
  main,
} from './main.js'

front()

function front() {
  const iterations = $$iterations
  const injections = $$injections

  const tags = '{{Tags}}'.split(' ')
  const cardType = '{{Card}}'

  const injectionsParsed = parseInjections(
    injections,
    iterations.map(v => v.name),
    tags,
    cardType,
  )

  const [
    theSaveData,
    wereSetsUsed,
  ] = main(iterations, injectionsParsed, getData(), true)

  saveData(theSaveData)
  createWarnings(wereSetsUsed)
}
