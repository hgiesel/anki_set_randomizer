
export const namePatternRaw = '_?[a-zA-Z][a-zA-Z0-9_\\-]*'
export const namePattern = `(${namePatternRaw})`

const absoluteIdxPattern = `(\\d+)`
const absoluteNegIdxPattern = `n(-\\d+)`
const relativeIdxPattern = `((?:\\+|-)?\\d+)`

const allSetsPattern = `(\\*)`
const absoluteYankPattern = `_(\\d+)`
const allYanksPattern = `_(\\*)`

const valSetPos = `(\\d+|\\*|_)`

export const valueSetName = `\\$(${namePatternRaw}|\\*|_|\\$)(?:(?::${valSetPos})?:${valSetPos})?`
export const valueSetRegex = new RegExp(`^${valueSetName}$`, 'u')

export const ruleName = `(?:${valueSetName}|uc:${namePattern})`

export const amountPattern = '(\\d+|\\*|\\+|\\?)'

const intPattern = '\\d+'
const realPattern = `\\d+(?:\\.\\d*)?`
export const numberGenerator = `(${realPattern}):(${realPattern})(?::(${intPattern}))?`

const keywordPattern = (
  `${namePattern}` /* the keyword */
  + `(?:=`
  + `(?:`
  + `\\[(.*?)\\]|` /* list notation */
  + `"(.*?)"|` /* double quote notation */
  + `'(.*?)'|` /* single quote notation */
  + `([^,]+)` /* no-comma notation */
  + `)?)?`
)

const keywordRegex = new RegExp(keywordPattern, 'gmu')
export const keywordArgPattern = '(.*)'

///// LATE EVALUATION REGEXES
export const posPattern = `(?:`
  + `${absoluteIdxPattern}|`
  + `${absoluteNegIdxPattern}|`
  + `${relativeIdxPattern}|`
  + `${allSetsPattern}|`
  + `${absoluteYankPattern}|`
  + `${allYanksPattern}|`
  + `(${namePatternRaw}(?::[0-9a-zA-Z_\\-]+)*)`
  + `)`

export const availableShapes = `(rect|ellipse|polygon|line|arrow|darrow)`
export const attributeList = `(\\d+(?::\\d+){2,})`

/// for kwargs and numbered
export const newLinePattern = /\\n/gu
export const catchPattern = /\\./gu
export const singleQuotePattern = /\\\\'/u
export const doubleQuotePattern = /\\\\"/u
