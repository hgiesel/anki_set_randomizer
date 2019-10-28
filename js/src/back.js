import {
  getData,
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

back()

function back() {
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
    _,
    wereSetsUsed,
  ] = main(iterations, injectionsParsed, getData(), false)

  createWarnings(wereSetsUsed)
}
