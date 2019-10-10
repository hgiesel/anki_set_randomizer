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

  const options = $$options

  if (!window.Persistence) {
    createWarningNotDefined()
  }

  else if (!Persistence.isAvailable()) {
    const [
      _,
      wereSetsUsed,
    ] = main(options, getNullData(), false)

    createWarningNotAvailable(wereSetsUsed)
  }

  else {
    main(options, getData(), false)
  }
}
