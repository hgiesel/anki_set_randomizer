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
  const options = $$options

  const [
    theSaveData,
    wereSetsUsed,
  ] = main(options, getNullData(), true)

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
