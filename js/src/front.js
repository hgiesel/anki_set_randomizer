import {
  getNullData,
  saveData,
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

const front = function() {
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
  ] = main(iterations, injectionsParsed, getNullData())

  saveData(theSaveData)
  createWarnings(wereSetsUsed)
}

try {
  front()
}

catch (e) {
  console.error(`Front Exception Caught`, e)
  // throw `Front Exception Caught: ${e}`
}
