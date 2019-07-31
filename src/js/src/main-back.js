import { escapeString, shuffle } from './lib/util'
import formatter from './lib/formatter'

if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("AnkiSetRandomizerOptions")) {
  const options = Persistence.getItem("AnkiSetRandomizerOptions")
  console.log(options)

  const form = formatter()
  console.log(form.getOriginalStructure())

  // console.log(sortByIndices(['a', 'b', 'c'], [2,1,0]))
}
