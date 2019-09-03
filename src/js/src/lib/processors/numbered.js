import {
  namePattern,
} from './util.js'

function generateRandomValue(min, max, extra, isReal) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

// also processes generator patterns
export function processNumberedSets(originalStructure, preGeneratedValues) {
  const result          = []
  const generatorValues = []

  const positionSymbol  = ':'
  const positionPattern = `${positionSymbol}(n(?:-\\d+)?|-\\d|\\d+)`

  const evaluators = []
  const valueSets = []

  const evaluatorPattern = new RegExp(
    `^\\$(?:evaluate|eval|e)\\(` +
    `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
    `(?:\\s*,\\s*(${namePattern}))?\\)` // uniqueness constraint
  )

  // get value sets
  const valueSetPattern = new RegExp(
    `^\\$(?:generate|gen|g)\\(` +
    `(${namePattern})\\s*,\\s*` +
    `\\[((?:.|\\n|\\r)*)\\]` +
    `\\)`, 'm')

  // get value sets
  const valueSetShortcutPattern = new RegExp(
    `^\\$(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
  )

  const singleQuotePattern = new RegExp(`\\\\'`, 'g')
  const doubleQuotePattern = new RegExp(`\\\\"`, 'g')
  const newLinePattern = new RegExp(`\\\\n`, 'g')
  const catchPattern = new RegExp(`\\\\.`, 'g')

  const valueSetTokens = '(?:\'((?:.|\\n|\\r)*?[^\\\\])\'|"((?:.|\\n|\\r)*?[^\\\\])")'

  for (const elem of originalStructure.flat()) {
    let match

    if (match = elem[2].match(valueSetPattern)) {
      const elements = []

      const valueSetTokensRegex = new RegExp(valueSetTokens, 'gm')
      let contentMatch = valueSetTokensRegex.exec(elem[2])

      while (contentMatch) {

        if (contentMatch[1]) {
          elements.push(contentMatch[1]
            .replace(singleQuotePattern, "'")
            .replace(newLinePattern, '<br/>')
            .replace(catchPattern, (x) => x.slice(1))
          )
        }
        else if (contentMatch[2]) {
          elements.push(contentMatch[2]
            .replace(doubleQuotePattern, '"')
            .replace(newLinePattern, '<br/>')
            .replace(catchPattern, (x) => x.slice(1))
          )
        }

        contentMatch = valueSetTokensRegex.exec(elem[2])
      }

      valueSets.push({
        name: match[1],
        elements: elements,
        idx: 0,
        set: elem[0],
        pos: elem[1],
      })
    }

    else if (match = elem[2].match(valueSetShortcutPattern)) {
      valueSets.push({
        name: match[1],
        elements: match[3]
          .replace(new RegExp(`\\\\${match[2]}`, 'g'))
          .replace(newLinePattern, '<br/>')
          .replace(catchPattern, (x) => x.slice(1))
          .split(match[2]),
        idx: 0,
        set: elem[0],
        pos: elem[1],
      })
    }

    else if (match = elem[2].match(evaluatorPattern)) {
      if (match[1]) {
        evaluators.push([match[1], match[2] || "*", match[3] || '*'])
      }
    }
  }

  const lastMinutePattern = new RegExp(`^\\$(n|name)!\\(\\)$`)

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
  const realIntGenerator =
    `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`

  const generatorPattern = new RegExp(
    `^\\$(?:pick|p)\\(` +
    `(?:${realIntGenerator}|` +
    `(${namePattern})(?:${positionPattern})?)` +
    `(?:\\s*,\\s*(${namePattern}))?\\)` // uniqueness constraint
  )

  const contentElementPattern = new RegExp('^[^\\$]')

  const uniquenessSets = []

  for (const [i, set] of originalStructure.entries()) {

    const contentElements = []
    let lastMinute = false

    for (const elem of set) {

      let patternResult

      if (lastMinutePattern.test(elem[2])) {
        lastMinute = true
      }

      else if (patternResult = elem[2].match(generatorPattern)) {

        const uniquenessConstraintName = patternResult[6]

        const minValue   = patternResult[1]
        const maxValue   = patternResult[2]
        const extraValue = patternResult[3]

        const generatorSetName  = patternResult[4]
        const generatorSetIndex = Number(patternResult[5])

        if (
          uniquenessConstraintName &&
          !uniquenessSets.find(v => v.name === uniquenessConstraintName)
        ) {
          uniquenessSets.push({
            name: uniquenessConstraintName,
            values: []
          })
        }

        const setIndex  = elem[0]
        const elemIndex = elem[1]

        let resultValue

        let maybePregeneratedValue
        if (maybePregeneratedValue = preGeneratedValues
          .find(v => v[0] === setIndex && v[1] === elemIndex)) {
          resultValue = maybePregeneratedValue[2]
        }

        else if (minValue && maxValue) {
          // generate a random integer or real number
          const isReal = minValue.includes('.') || maxValue.includes('.')

          resultValue = generateRandomValue(
            Number(minValue),
            Number(maxValue),
            Number(extraValue),
            isReal,
          )

          if (uniquenessConstraintName) {
            let countIdx = 0
            const countIdxMax = 1000

            while (uniquenessSets
              .find(v => v.name === uniquenessConstraintName)
              .values.includes(resultValue)
              && countIdx < countIdxMax) {

              resultValue = generateRandomValue(
                Number(minValue),
                Number(maxValue),
                Number(extraValue),
                isReal,
              )

              countIdx++
            }

            if (countIdx == countIdxMax) {
              resultValue = null
            }
          }
        }

        else {
          // generator set name

          const foundGeneratorSet = generatorSets
            .find(v => v.name === generatorSetName)

          if (foundGeneratorSet) {

            resultValue = typeof generatorSetIndex !== 'number' || Number.isNaN(generatorSetIndex)
              ? foundGeneratorSet.elements[Math.floor(Math.random() * foundGeneratorSet.elements.length)]
              : generatorSetIndex >= 0
                ? foundGeneratorSet.elements[
                  foundGeneratorSet.elements.length <= generatorSetIndex
                    ? null // foundGeneratorSet.elements.length - 1
                    : generatorSetIndex
                ]
                : foundGeneratorSet.elements[
                  foundGeneratorSet.elements.length + generatorSetIndex < 0
                    ? null // 0
                    : foundGeneratorSet.elements.length + generatorSetIndex
                ]

            if (uniquenessConstraintName) {
              let countIdx = 0
              const countIdxMax = 1000

              while (uniquenessSets
                .find(v => v.name === uniquenessConstraintName)
                .values.includes(resultValue)
                && countIdx < countIdxMax) {

                const idx   = Math.floor(Math.random() * foundGeneratorSet.elements.length)
                resultValue = foundGeneratorSet.elements[idx]

                countIdx++
              }

              if (countIdx == countIdxMax) {
                resultValue = null
              }
            }
          }
        }
        // else -> no element can be generated
        // get resultValue2

        if (resultValue) {
          const resultValue2 = [setIndex, elemIndex, resultValue]

          if (uniquenessConstraintName) {
            uniquenessSets
              .find(v => v.name === uniquenessConstraintName)
              .values.push(resultValue)
          }

          generatorValues.push(resultValue2)
          contentElements.push(resultValue2)
        }
      }

      else if (valueSetPattern.test(elem[2]) || valueSetShortcutPattern.test(elem[2])) {
        const revEvaluators = evaluators.reverse()
        console.log( revEvaluators )

        const vs = valueSets.find(e => e.set === elem[0] && e.pos === elem[1])

        if (vs) {
          const theEval = revEvaluators
            .find(ev => ev[0] === vs.name && (ev[1] === vs.idx || ev[1] === '*'))
          console.log(vs)

          if (theEval) {

            const resultValue = [elem[0], elem[1], vs.elements[theEval === '*'
              ? Math.floor(Math.random() * vs.elements.length)
              : theEval[2]
            ]]

            generatorValues.push(resultValue)
            contentElements.push(resultValue)
          }
        }
      }

      else if (contentElementPattern.test(elem[2]) || elem[2].length === 0) {
        contentElements.push(elem)
      }
    }

    result.push({
      name: i,
      elements: contentElements,
      lastMinute: lastMinute,
    })
  }

  return [result, generatorValues]
}

