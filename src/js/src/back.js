import {
  getData,
  createWarningNotDefined,
  createWarningNotAvailable,
  getNullData,
} from './save.js'

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

  if (!window.Persistence) {
    createWarningNotDefined()
  }

  else if (!Persistence.isAvailable()) {
    const [
      _,
      wereSetsUsed,
    ] = main(iterations, injectionsParsed, getNullData(), false)

    createWarningNotAvailable(wereSetsUsed)
  }

  else {
    main(iterations, injectionsParsed, getData(), false)
  }
}
