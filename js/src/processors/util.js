const left = Symbol('left')
const right = Symbol('right')
const center = Symbol('center')

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

const namePatternRaw = '[a-zA-Z_][a-zA-Z0-9_\\-]*'
const namePatternNonCapturing = `(?:${namePatternRaw}|\\*)`
export const namePattern = `(${namePatternRaw}|\\*)`

const absoluteIdxPattern = `(\\d+)`
const absoluteNegIdxPattern = `n(-\\d+)`
const relativeIdxPattern = `((?:\\+|-)?\\d+)`

export const valSetPos = `(\\d+|\\*)`

export const valueSetName = `\\$${namePattern}(?:(?::${valSetPos})?:${valSetPos})?`
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

export const keywordArgPattern = (
  `(`

  + `(?:${namePatternNonCapturing})=` /* the keyword */
  + `(?:`
  + `\\[(?:.*?)\\]|` /* list notation */
  + `"(?:.*?)"|` /* double quote notation */
  + `'(?:.*?)'|` /* single quote notation */
  + `(?:[^,]+)` /* no-comma notation */
  + `)?`

  + `(?:\\s*,\\s*`
  + `(?:${namePatternNonCapturing})=` /* the keyword */
  + `(?:`
  + `\\[(?:.*?)\\]|` /* list notation */
  + `"(?:.*?)"|` /* double quote notation */
  + `'(?:.*?)'|` /* single quote notation */
  + `(?:[^,]+)` /* no-comma notation */
  + `)?`
  + `)*`

  + `)?`
)

const uniqConstraintPattern = (
  `(?:(uniq)(?:=(${namePatternNonCapturing}?))?)`
)

export const pickPattern = new RegExp(wrapName(['pick'], [
  wrapArg(amountPattern, left, true),
  wrapArg(`(?:${numberGenerator}|${valueSetName})`),
  wrapArg(uniqConstraintPattern, right, true),
]), 'u')

export const evalPattern = new RegExp(wrapName(['evaluate', 'eval'], [
  wrapArg(amountPattern, left, true),
  wrapArg(valueSetName),
  wrapArg(uniqConstraintPattern, right, true),
]), 'u')

export const availableShapes = `(rect|ellipse|polygon|line|arrow|darrow)`
export const attributeList = `(\\d+(?::\\d+){2,})`

export const yankPattern = new RegExp(wrapName(['occlude', 'occ'], [
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
  + `(${namePatternNonCapturing}(?::${namePatternNonCapturing})*)`
  + `)`

export const namedSetPattern = new RegExp(wrapName(['name'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
  wrapArg(keywordArgPattern /* order and force */, right, true),
]), 'u')

export const availableCommands = `(copy|del|move|swap|repl)`

export const commandPattern = new RegExp(wrapName(['cmd'], [
  wrapArg(valueSetName, left, true),
  wrapArg(availableShapes, right),
  wrapArg(amountPattern, center, true),
  wrapArg(posPattern /* fromPosition */, right, true),
  wrapArg(posPattern /* toPosition */, right, true),
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
