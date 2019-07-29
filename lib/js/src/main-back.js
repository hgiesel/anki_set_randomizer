import update from './lib/update'
import { sortByIndices } from './lib/sort'
import { escapeString, shuffle } from './lib/util'

if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("multipleChoiceSettings")) {
  const settings = Persistence.getItem("multipleChoiceSettings")

  const query = settings.query
  const colors = settings.colors
  const fieldPadding = settings.fieldPadding

  const syntax = {
    openDelim: settings.syntax.openDelim,
    closeDelim: settings.syntax.closeDelim,
    fieldSeparator: settings.syntax.fieldSeparator,
  }
  const output = {
    openDelim: settings.output.openDelim,
    closeDelim: settings.output.closeDelim,
    fieldSeparator: settings.output.fieldSeparator,
  }

  const exprRegex = RegExp(
    `(?:${escapeString(syntax.openDelim)})(.*?)(?:${escapeString(syntax.closeDelim)})`,
    'gm'
  )

  const results = []
  var theBody = document.querySelector(query).innerHTML

  var m = exprRegex.exec(theBody)

  while (m) {
    results.push(m[1])
    m = exprRegex.exec(theBody)
  }

  console.log(sortByIndices(['a', 'b', 'c'], [2,1,0]))
  update()
}
