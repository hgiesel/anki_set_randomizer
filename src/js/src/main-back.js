import {
  getData,
} from './save.js'

import {
  main,
} from './main.js'

if (window.Persistence && Persistence.isAvailable()) {
  const srData = getData()

  for (const compilation of srData) {
    main(false, ...compilation)
  }
}
