import {
  saveData,
  createWarningNotDefined,
  createWarningNotAvailable,
  getNullData,
} from './save.js'

import {
  main,
} from './main.js'

front()

function front() {
  const iterations = $$iterations
  const injections = $$injections

  const [
    theSaveData,
    wereSetsUsed,
  ] = main(iterations, getNullData(), true)

  if (!window.Persistence) {
    createWarningNotDefined()
  }

  else if (!Persistence.isAvailable()) {
    createWarningNotAvailable(wereSetsUsed)
  }

  else {
    saveData(theSaveData)
  }
}
