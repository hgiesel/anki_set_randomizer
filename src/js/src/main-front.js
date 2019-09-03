import {
  saveData,
} from './save.js'

import {
  main,
} from './main.js'


// document.addEventListener("DOMContentLoaded", function() {
if (window.Persistence && Persistence.isAvailable() &&
   (document.querySelector('div#qa') === null ||
     !(new RegExp('// \S\E\T RANDOMIZER BACK TEMPLATE'))
     .test(document.querySelector('div#qa').innerHTML))) {
  mainFront()
}
// })

function getNullData() {
  return [
    [/* originalStructure */],
    [/* generatorValues */],
    [/* reorders */],
    [/* reordersSecond */],
    {/* randomIndices */},
  ]
}

function mainFront() {

  const options = $$options

  const theSaveData = options
    .reduce((accu, v) => {

      const saveData = main(
        true,
        v.inputSyntax,
        v.defaultStyle,
        ...accu[1],
      )

      return [
        (accu[0].push([
          v.inputSyntax,
          v.defaultStyle,
          ...saveData,
        ]), accu[0]),
        saveData,
      ]
    }, [
      [/* SRData to be */],
      getNullData(),
    ])[0]

  saveData(theSaveData)
}
