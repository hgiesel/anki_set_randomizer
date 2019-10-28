export const namePattern     = '(?:[a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)'
export const positionPattern = `:(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))`

export const valueSetPattern = `(${namePattern})(?:(?:${positionPattern})?${positionPattern})?`
