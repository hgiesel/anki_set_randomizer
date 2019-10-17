import {
  getData,
  createWarningNotDefined,
  createWarningNotAvailable,
  getNullData,
} from './save.js'

import {
  main,
} from './main.js'


back()

function back() {
  const iterations = $$iterations
  const injections = $$injections

  if (!window.Persistence) {
    createWarningNotDefined()
  }

  else if (!Persistence.isAvailable()) {
    const [
      _,
      wereSetsUsed,
    ] = main(iterations, getNullData(), false)

    createWarningNotAvailable(wereSetsUsed)
  }

  else {
    main(iterations, getData(), false)
  }
}
