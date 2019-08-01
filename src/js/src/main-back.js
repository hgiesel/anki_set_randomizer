import { escapeString } from './lib/util'
import formatter from './lib/formatter'

if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("AnkiSetRandomizerOptions")) {
  const options = Persistence.getItem("AnkiSetRandomizerOptions")
  console.log(options)

  const form = formatter(options)
  console.log(form.getOriginalStructure())

  // Removing all items...
  Persistence.removeItem("AnkiSetRandomizerOptions")
}
