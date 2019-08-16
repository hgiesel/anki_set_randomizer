


  var origResults = []
  for ([i, group] of innerSplitResults.entries()) {

    var newGroup = []
    for ([j, field] of group.entries()) {

      if (refRegex.test(field[2])) {
        var refGroup = field[2].match(/\d+/)[0]
        for (elem of origResults[refGroup]) {
          newGroup.push([...elem])
        }
      }

      else if (drawRegex.test(field[2])) {
        var match      = field[2].match(/^\^(\d+)\+(\d+)$/)
        var drawGroup  = match[1]
        var drawAmount = match[2]

        for (i = 0; i < drawAmount; i++) {
          var lastElemIndex = [...origResults[drawGroup]].reverse().findIndex(v => v[3])
          if (lastElemIndex != -1) {
            var actualIndex = origResults[drawGroup].length - lastElemIndex - 1
            newGroup.push([...origResults[drawGroup][actualIndex]])

            // set visibility to false
            origResults[drawGroup][actualIndex][3] = false
          }
        }
      }

      else {
        var iIndex = alteredResults[i][j][0]
        var jIndex = alteredResults[i][j][1]
        var newContent = innerSplitResults[iIndex][jIndex][2]

        newGroup.push([iIndex, jIndex, newContent, true])
      }
    }

    origResults.push(newGroup)
  }

  var stylizedOrigResults = []
  for (group of origResults) {
    var actualvaluesorig = []
    for ([i, field] of group.entries()) {
      if (field[3]) {
        var theIndex = i % colors.length
        actualvaluesorig.push(`<span style="color: ${colors[theIndex]}; padding: 0px ${fieldPadding};">${field[2]}</span>`)
      }
    }

    stylizedOrigResults.push(actualvaluesorig.join(output.fieldSeparator))
  }

  for ([i, v] of results.entries()) {
    var replacementorig = document.getElementById('original').innerHTML
      .replace(`${syntax.openDelim}${v}${syntax.closeDelim}`, `${output.openDelim}${stylizedOrigResults[i]}${output.closeDelim}`)
    document.getElementById('original').innerHTML = replacementorig
  }
}
