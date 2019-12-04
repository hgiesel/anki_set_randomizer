import {
  getData,
} from './persistence.js'

import {
  createWarnings,
} from './util.js'

import {
  parseInjections,
} from './inject.js'

import {
  main,
} from './main.js'

const back = function() {
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

  main(iterations, injectionsParsed, getData())
  createWarnings()
}


try {
  back()
}

catch (e) {
  console.error('Back Exception Caught', e)
  // throw `Back Exception Caught: ${e}`
}

