const left = Symbol('left')
const right = Symbol('right')
const center = Symbol('center')

// wraps in non-capturing group
const wrapName = (names, args) => (
  `^\\$(?:${names.join('|')})` +
  `\\(${args.join('')}\\)$`
)

// wraps in non-capturing group
const wrapArg = (val, alignment=center, optional=false) => {
  switch (alignment) {
    case left:
      return `(?:\\s*${val}\\s*,)` + (optional ? '?' : '')
    case right:
      return `(?:,\\s*${val}\\s*)` + (optional ? '?' : '')
    default:
      return `(?:\\s*${val}\\s*)` + (optional ? '?' : '')
  }
}

export const namePattern = '([a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)'
const namePatternNonCapturing = '(?:[a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)'

const absoluteIdxPattern = `(\\d+)`
const absoluteNegIdxPattern = `n(-\\d+)`
const relativeIdxPattern = `((?:\\+|-)?\\d+)`
const starPattern = `(\\*)`

export const valSetPos = (
  `(?:${relativeIdxPattern}|${starPattern})`
)

export const valueSetName = `\\$${namePattern}(?:(?::${valSetPos})?:${valSetPos})?`

export const valueSetPattern = new RegExp(
  `^\\$${namePattern}` +
  `(?!\\()` /* no opening parenthesis allowed */ +
  `(\\W)` /* separator character */ +
  `((?:.|\\n|\\r)*)`
)

const amountPattern = '(\\d+|\\*)'

const intPattern      = '\\d+'
const realPattern     = `\\d+(?:\\.\\d*)?`
const numberGenerator = `(${realPattern}):(${realPattern})(?::(${intPattern}))?`

export const keywordPattern = (
  `${namePattern}=` /* the keyword */ +
  `(?:` +
  `\\[(.*?)\\]|` /* list notation */ +
  `"(.*?)"|` /* double quote notation */ +
  `'(.*?)'|` /* single quote notation */ +
  `([^,]+)` /* no-comma notation */ +
  `)?`
)
export const keywordRegex = new RegExp(keywordPattern, 'gm')

export const keywordArgPattern = (
  `(` +

  `(?:${namePatternNonCapturing})=` /* the keyword */ +
  `(?:` +
  `\\[(?:.*?)\\]|` /* list notation */ +
  `"(?:.*?)"|` /* double quote notation */ +
  `'(?:.*?)'|` /* single quote notation */ +
  `(?:[^,]+)` /* no-comma notation */ +
  `)?` +

  `(?:\\s*,\\s*` +
  `(?:${namePatternNonCapturing})=` /* the keyword */ +
  `(?:` +
  `\\[(?:.*?)\\]|` /* list notation */ +
  `"(?:.*?)"|` /* double quote notation */ +
  `'(?:.*?)'|` /* single quote notation */ +
  `(?:[^,]+)` /* no-comma notation */ +
  `)?` +
  `)*` +

  `)?`
)

export const pickPattern = new RegExp(
  wrapName(['pick', 'p'], [
    wrapArg(amountPattern, left, true),
    wrapArg(`(?:${numberGenerator}|${valueSetName})`),
    wrapArg(keywordArgPattern /* uniqConstraint */, right, true),
  ])
)

export const evalPattern = new RegExp(
  wrapName(['evaluate', 'eval', 'e'], [
    wrapArg(amountPattern, left, true),
    wrapArg(valueSetName),
    wrapArg(keywordArgPattern /* uniqConstraint */, right, true),
  ])
)

export const attributeList = `(\\w):(\\d+(?::\\d+)*)`

export const yankPattern = new RegExp(wrapName(['yank', 'y'], [
  wrapArg(amountPattern /* imageid */, left, true),
  wrapArg(namePattern /* yankgroup */, center),
  wrapArg(attributeList, right),
  wrapArg(keywordArgPattern /* text */, right, true),
]), 'u')

///// LATE EVALUATION REGEXES
const idxPattern = `(?:`
  + `${absoluteIdxPattern}|`
  + `${absoluteNegIdxPattern}|`
  + `${relativeIdxPattern}|`
  + `${namePattern}`
  + `)`

const posPattern = `${idxPattern}(?::${relativeIdxPattern})?`

export const namedSetPattern = new RegExp(wrapName(['name', 'n'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
  wrapArg(keywordArgPattern /* order and force */, right, true),
]), 'u')

export const commandPattern = new RegExp(wrapName([
  '(c|copy)', '(m|move)', '(d|del|delete)', '(x|xch|xchange)', '(r|repl|replace)'
], [
  wrapArg(valueSetName, left, true),
  wrapArg(amountPattern, center, true),
  wrapArg(posPattern /* fromPosition */, right, true),
  wrapArg(posPattern /* toPosition */, right, true),
]), 'u')

//////// STYLING REGEXES
export const stylePattern = new RegExp(wrapName(['s', 'style'], [
  wrapArg(namePattern, center),
  wrapArg(keywordArgPattern /* stylingDirectives */, right, true),
]), 'u')

export const applyPattern = new RegExp(wrapName(['a', 'apply'], [
  wrapArg(valueSetName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
]), 'u')
