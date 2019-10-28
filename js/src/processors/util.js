const left = Symbol('left')
const right = Symbol('right')
const center = Symbol('center')

const wrapName(vals) => `^\\$(?:${vals.join('|')})`
const wrapArg(val, alignment=center, optional=false) => {
  switch (alignment) {
    case left:
      return `(?:\\s*${val}\\s*,)` + (optional ? '?' : '')
    case right:
      return `(?:,\\s*${val}\\s*)` + (optional ? '?' : '')
    case center:
      return `(?:\\s*${val}\\s*)` + (optional ? '?' : '')
  }
}

const wrapArgs(vals) => `\\(${vals.join('')}\\)$`

const valueSetPattern = new RegExp(
  `^\\$(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
)

const intPattern      = '\\d+'
const realPattern     = `\\d+(?:\\.\\d*)?`
const numberGenerator = `(${realPattern}):(${realPattern})(?::(${intPattern}))?`

const amountPattern = '(\\d+\\)|(\\*)

const pickPattern = new RegExp(
  wrapName(['pick', 'p']) +
  wrapArgs([
    wrapArg(amountPattern, left, true),
    wrapArg(`(?:${numberGenerator}|${valueSetPattern})`),
    wrapArg(namePattern, right, true),
  ])
)

const evaluatorPattern = new RegExp(
  wrapName(['evaluate', 'eval', 'e']) +
  wrapArgs([
    wrapArg(amountPattern, left, true),
    wrapArg(valueSetPattern),
    wrapArg(namePattern, right, true),
  ])
)

const yankPattern = new RegExp(
  wrapName(['yank', 'y']) +
  wrapArgs([
    wrapArg(amountPattern /* imageid */, left, true),
    wrapArg(namePattern /* yankgroup */),
    wrapArg(/* TODO attribute list */, right),
    wrapArg(/* TODO text */, right, true),
  ])
)

/////

const namePositionPattern = (
  `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
  `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
)

const namedSetPattern = new RegExp(
  wrapName(['name', 'n']) +
  wrapArgs([
    wrapArg(valueSetPattern, left, true),
    wrapArg(namePattern, center, true),
    wrapArg(namePositionPattern, right, true),
  ])
)

const idxPattern      = `(?:(\\d+)|((?:\\+|-)\\d+)|n(-\\d+)|(${namePattern}))`
const positionPattern = ':(?:\\+?(\\d+)|n?(-\\d+))'
const posPattern = `${idxPattern}(?:${positionPattern})?`

const commandPattern = new RegExp(
  wrapName(['(c|copy)', '(m|move)', '(d|del|delete)', '(x|xch|xchange)', '(r|repl|replace)']) +
  wrapArgs([
    wrapArg(valueSetPattern, left, true),
    wrapArg(amountPattern, center, true),
    wrapArg(posPattern /* fromPosition */, right, true),
    wrapArg(posPattern /* toPosition */, right, true),
  ])
)

//////// STYLING REGEXES
const stylePattern = new RegExp(
  wrapName(['s', 'style']) +
  wrapArgs([
    wrapArg(valueSetPattern, left, true),
    wrapArg(namePattern, center),
    wrapArg('(.*)' /* stylingDirectives */, right, true),
  ])
)

const applyPattern = new RegExp(
  wrapName(['a', 'apply']) +
  wrapArgs([
    wrapArg(valueSetPattern, left, true),
    wrapArg(namePattern, center),
    wrapArg(namePositionPattern, right, true),
  ])
)
export const namePattern     = '(?:[a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)'
export const positionPattern = `:(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))`

export const valueSetPattern = `(\\$${namePattern})(?:(?:${positionPattern})?${positionPattern})?`
