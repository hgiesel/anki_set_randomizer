import {
  amountPattern,
  numberGenerator,
  valueSetName,
  keywordArgPattern,
  namePattern,
  attributeList,
  availableShapes,
  ruleName,
  posPattern,
} from './grammar.js'

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

export const valueSetPattern = new RegExp(`^\\$${namePattern}`
  + `(?!\\()` /* no opening parenthesis allowed */
  + `(\\W)` /* separator character */
  + `((?:.|\\n|\\r)*)`, 'u')

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

export const yankPattern = new RegExp(wrapName(['yank'], [
  wrapArg(amountPattern /* imageid */, left, true),
  wrapArg(namePattern /* yankgroup */, center),
  wrapArg(availableShapes, right),
  wrapArg(attributeList, right),
  wrapArg(keywordArgPattern /* text */, right, true),
]), 'u')

//////// STYLING REGEXES
export const stylePattern = new RegExp(wrapName(['style'], [
  wrapArg(namePattern, center),
  wrapArg(keywordArgPattern /* stylingDirectives */, right, true),
]), 'u')

export const namedSetPattern = new RegExp(wrapName(['name'], [
  wrapArg(ruleName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
]), 'u')

export const orderPattern = new RegExp(wrapName(['order'], [
  wrapArg(ruleName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
]), 'u')

export const availableCommands = `(copy|del|move|swap|repl)`

export const commandPattern = new RegExp(wrapName(['cmd'], [
  wrapArg(ruleName, left, true),
  wrapArg(amountPattern, left, true),
  wrapArg(availableCommands, center),
  wrapArg(posPattern /* fromPosition */, right, true),
  wrapArg(posPattern /* toPosition */, right, true),
]), 'u')

export const applyPattern = new RegExp(wrapName(['apply'], [
  wrapArg(ruleName, left, true),
  wrapArg(namePattern, center),
  wrapArg(posPattern, right, true),
]), 'u')
