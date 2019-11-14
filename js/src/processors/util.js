const left = Symbol('left')
const right = Symbol('right')
const center = Symbol('center')

export const newLinePattern = /\\n/gu
export const catchPattern = /\\./gu

// wraps in non-capturing group
const wrapName = (names, args) => (
  `^\\$(?:${names.join('|')})`
  + `\\(${args.join('')}\\)$`
)

// wraps in non-capturing group
const wrapArg = function(val, alignment = center, optional = false) {
  return `(?:${alignment === right ? ',' : ''}\\s*${val}\\s*${alignment === left ? ',' : ''})`
    + `${optional ? '?' : ''}`
}

export const namePatternRaw = '_?[a-zA-Z][a-zA-Z0-9_\\-]*'
export const namePattern = `(${namePatternRaw})`

const absoluteIdxPattern = `(\\d+)`
const absoluteNegIdxPattern = `n(-\\d+)`
const relativeIdxPattern = `((?:\\+|-)?\\d+)`

const allSetsPattern = `(\\*)`
const absoluteYankPattern = `_(\\d+)`
const allYanksPattern = `_(\\*)`

export const valSetPos = `(\\d+|\\*|_)`

export const valueSetName = `\\$(${namePatternRaw}|\\*|_|\\$)(?:(?::${valSetPos})?:${valSetPos})?`

export const vsRegex = new RegExp(`^\\$(${namePatternRaw}|\\*|_|\\$)(?:(?::${valSetPos})?:${valSetPos})?$`, 'u')

export const valueSetPattern = new RegExp(`^\\$${namePattern}`
  + `(?!\\()` /* no opening parenthesis allowed */
  + `(\\W)` /* separator character */
  + `((?:.|\\n|\\r)*)`, 'u')

const amountPattern = '(\\d+|\\*)'

const intPattern = '\\d+'
const realPattern = `\\d+(?:\\.\\d*)?`
const numberGenerator = `(${realPattern}):(${realPattern})(?::(${intPattern}))?`

export const keywordPattern = (
  `${namePattern}` /* the keyword */
  + `(?:=`
  + `(?:`
  + `\\[(.*?)\\]|` /* list notation */
  + `"(.*?)"|` /* double quote notation */
  + `'(.*?)'|` /* single quote notation */
  + `([^,]+)` /* no-comma notation */
  + `)?)?`
)

export const keywordRegex = new RegExp(keywordPattern, 'gmu')
export const keywordArgPattern = '(.*)'

export const pickPattern = new RegExp(wrapName(['pick'], [
  wrapArg(amountPattern, left, true),
  wrapArg(`(?:${numberGenerator}|${valueSetName})`),
  wrapArg(keywordArgPattern, right, true),
]), 'u')

export const evalPattern = new RegExp(wrapName(['evaluate', 'eval'], [
  wrapArg(amountPattern, left, true),
  wrapArg(valueSetName),
  wrapArg(keywordArgPattern, right, true),
]), 'u')

export const availableShapes = `(rect|ellipse|polygon|line|arrow|darrow)`
export const attributeList = `(\\d+(?::\\d+){2,})`

export const yankPattern = new RegExp(wrapName(['yank'], [
  wrapArg(amountPattern /* imageid */, left, true),
  wrapArg(namePattern /* yankgroup */, center),
  wrapArg(availableShapes, right),
  wrapArg(attributeList, right),
  wrapArg(keywordArgPattern /* text */, right, true),
]), 'u')

///// LATE EVALUATION REGEXES
const posPattern = `(?:`
  + `${absoluteIdxPattern}|`
  + `${absoluteNegIdxPattern}|`
  + `${relativeIdxPattern}|`
  + `${allSetsPattern}|`
  + `${absoluteYankPattern}|`
  + `${allYanksPattern}|`
  + `(${namePatternRaw}(?::[0-9a-zA-Z_\\-]+)*)`
  + `)`

export const namedSetPattern = new RegExp(wrapName(['name'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
  wrapArg(keywordArgPattern /* force */, right, true),
]), 'u')

export const orderPattern = new RegExp(wrapName(['order'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
  wrapArg(keywordArgPattern, right, true),
]), 'u')

export const availableCommands = `(copy|del|move|swap|repl)`

export const commandPattern = new RegExp(wrapName(['cmd'], [
  wrapArg(valueSetName, left, true),
  wrapArg(availableShapes, right),
  wrapArg(amountPattern, center, true),
  wrapArg(posPattern /* fromPosition */, right, true),
  wrapArg(posPattern /* toPosition */, right, true),
  wrapArg(keywordArgPattern /* whatever */, right, true),
]), 'u')

//////// STYLING REGEXES
export const stylePattern = new RegExp(wrapName(['style'], [
  wrapArg(namePattern, center),
  wrapArg(keywordArgPattern /* stylingDirectives */, right, true),
]), 'u')

export const applyPattern = new RegExp(wrapName(['apply'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
]), 'u')
