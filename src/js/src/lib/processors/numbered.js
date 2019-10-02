import {
  namePattern,
  star,
} from './util.js'

function generateRandomValue(min, max, extra, isReal) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

// also processes generator patterns
export function processNumberedSets(originalStructure, preGeneratedValues) {

  const [
    evaluators,
  ] = evalEvaluations(originalStructure)

  const [
    valueSets,
    valueSetResolutions,
    uniquenessConstraints,
  ] = evalValueSets(originalStructure, evaluators)

  const [
    result,
    generatedValues,
  ] = evalPicks(originalStructure, valueSets, valueSetResolutions, uniquenessConstraints, preGeneratedValues)

  return [result, generatedValues, valueSets]
}

const sharedRegexes = {
  positionPattern:  `:(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))`,
}

function evalEvaluations(originalStructure) {
  const evaluators = []

  const evaluatorPattern = new RegExp(
    `^\\$(?:evaluate|eval|e)\\(` +
    `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
    `(?:(${namePattern})(?:(?:${sharedRegexes.positionPattern})?${sharedRegexes.positionPattern})?)` +
    `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
  )

  for (const elem of originalStructure.flat()) {
    let match

    // evaluations
    if (match = elem[2].match(evaluatorPattern)) {

      const count = match[1]
      const valueSetName = match[2]

      const maybeNumberSetIndex = Number(match[3])
      const maybeNumberValueIndex = Number(match[5])

      const uniquenessConstraint = match[7]

      evaluators.push([
        valueSetName,
        !Number.isNaN(maybeNumberSetIndex) ? maybeNumberSetIndex : star,
        !Number.isNaN(maybeNumberValueIndex) ? maybeNumberValueIndex : star,
        count != undefined ? Number(count) : 1,
        uniquenessConstraint,
      ])
    }
  }

  return [
    evaluators,
  ]
}

function evalValueSets(originalStructure, evaluators) {
  const valueSets = {}
  const valueSetResolutions = []
  const uniquenessConstraints = []

  const valueSetPattern = new RegExp(
    `^\\$(\\$)?(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
  )

  const valueSetTokens = '(?:\'((?:.|\\n|\\r)*?[^\\\\])\'|"((?:.|\\n|\\r)*?[^\\\\])")'

  // modifies evaluators !!!!!
  evaluators.reverse()

  // get value sets
  const singleQuotePattern = new RegExp(`\\\\'`, 'g')
  const doubleQuotePattern = new RegExp(`\\\\"`, 'g')
  const newLinePattern = new RegExp(`\\\\n`, 'g')
  const catchPattern = new RegExp(`\\\\.`, 'g')

  for (const elem of originalStructure.flat()) {
    let match

    // value set shortcut
    if (match = elem[2].match(valueSetPattern)) {
      const valueSetName     = match[2]
      const isSelfEvaluating = match[1] === '$' ? true : false

      const values = match[4]
        .split(new RegExp(`(?<!\\\\)\\${match[3]}`, 'g'))
        .map(v => v
          .replace(new RegExp(`\\${match[3]}`, 'g'), match[3])
          .replace(newLinePattern, '<br/>')
          .replace(catchPattern, (x) => x.slice(1))
        )

      const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
        name: valueSetName,
        idx: valueSets[valueSetName] ? valueSets[valueSetName].length : 0,
        values: values,
        set: elem[0],
        pos: elem[1],
      }) - 1

      const foundEvaluator = evaluators.find(v =>
        ((v[0] === valueSetName && v[1] === valueSetIndex) ||
          (v[0] === valueSetName && v[1] === star) ||
          (v[0] === star && v[1] === valueSetIndex) ||
          (v[0] === star && v[1] === star) && (v[2] === star || v[2] < values.length))
      )

      const resolvedValues = []
      let wasStar

      if (foundEvaluator) {
        wasStar = foundEvaluator[2] === star ? true : false

        for (let i = 0; i < foundEvaluator[3]; i++) {

          let theValue = `%%${valueSetName}%%${valueSetIndex}%%${
            foundEvaluator[2] !== star ? foundEvaluator[2] : Math.floor(Math.random() * values.length)
          }%%`

          const uniquenessConstraintName = foundEvaluator[4]

          if (uniquenessConstraintName) {

            if (!uniquenessConstraints.find(v => v.name === uniquenessConstraintName)) {
              uniquenessConstraints.push({
                name: uniquenessConstraintName,
                values: []
              })
            }

            let countIdx = 0
            const countIdxMax = 1000

            const uc = uniquenessConstraints
              .find(v => v.name === uniquenessConstraintName)
              .values

            while (uc.includes(theValue) && countIdx < countIdxMax) {

              theValue = `%%${valueSetName}%%${valueSetIndex}%%${
                Math.floor(Math.random() * values.length)
              }%%`

              if (foundEvaluator[2] !== star) {
                countIdx = countIdxMax
              }
              else {
                countIdx++
              }
            }

            if (countIdx === countIdxMax) {
              theValue = null
            }
            else {
              uniquenessConstraints
                .find(v => v.name === uniquenessConstraintName)
                .values
                .push(theValue)
            }
          }

          if (theValue !== null) {
            resolvedValues.push(theValue)
          }
        }
      }

      else if (isSelfEvaluating) {
        // even though technically it is star, the result is still predictable
        wasStar = false

        resolvedValues.push(...Array.from(
          valueSets[valueSetName][valueSetIndex].values.keys(),
          idx => `%%${valueSetName}%%${valueSetIndex}%%${idx}`,
        ))
      }

      if (resolvedValues.length > 0) {
        valueSetResolutions.push([
          elem[0],
          elem[1],
          resolvedValues,
          wasStar,
        ])
      }
    }
  }

  console.log(valueSetResolutions)

  return [
    valueSets,
    valueSetResolutions,
    uniquenessConstraints,
  ]
}

function evalPicks(originalStructure, valueSets, valueSetResolutions, uniquenessConstraints, preGeneratedValues) {

  const result = []
  const generatedValues = []

  const lastMinutePattern = new RegExp(`^\\$(n|name)!\\(\\)$`)

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
  const realIntGenerator =
    `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`

  const pickPattern = new RegExp(
    `^\\$(?:pick|p)\\(` +
    `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
    `(?:${realIntGenerator}|` +
    `(?:(${namePattern})(?:(?:${sharedRegexes.positionPattern})?${sharedRegexes.positionPattern})?)?)` +
    `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
  )

  const contentElementPattern = new RegExp('^[^\\$]')

  for (const [i, set] of originalStructure.entries()) {

    const contentElements = []
    let lastMinute = false

    for (const elem of set) {

      let match
      const setIndex  = elem[0]
      const elemIndex = elem[1]

      if (lastMinutePattern.test(elem[2])) {
        lastMinute = true
      }

      else if (match = valueSetResolutions.find(v => v[0] === setIndex && v[1] === elemIndex)) {

        let theElements
        let maybePregeneratedValues
        if (maybePregeneratedValues = preGeneratedValues
          .find(v =>
            v[0] === setIndex &&
            v[1] === elemIndex)) {
          theElements = maybePregeneratedValue[2]
        }
        else {
          theElements = match
        }

        contentElements.push(...match[2].map(v => [match[0], match[1], v]))

        if (match[3]) {
          generatedValues.push(...theElements)
        }
      }

      else if (match = elem[2].match(pickPattern)) {

        const count =
          match[1] !== undefined
          ? Number(match[1]) : 1

        const uniquenessConstraintName = match[9]

        const minValue   = match[2]
        const maxValue   = match[3]
        const extraValue = match[4]

        const valueSetName       = match[5]
        const maybeValueSetSetIndex   = Number(match[6])
        const maybeValueSetValueIndex = Number(match[8])

        const valueSetSetIndex = !Number.isNaN(maybeValueSetSetIndex)
        ? maybeValueSetSetIndex
        : match[7] ? star : 0

        const valueSetValueIndex = !Number.isNaN(maybeValueSetValueIndex)
        ? maybeValueSetValueIndex
        : star

        if (
          uniquenessConstraintName &&
          !uniquenessConstraints.find(v => v.name === uniquenessConstraintName)
        ) {
          uniquenessConstraints.push({
            name: uniquenessConstraintName,
            values: []
          })
        }

        const resultValues = []

        let maybePregeneratedValue
        if (maybePregeneratedValue = preGeneratedValues
          .find(v =>
            v[0] === setIndex &&
            v[1] === elemIndex)) {
          resultValues = maybePregeneratedValue[2]
        }

        else {

          for (let i = 0; i < count; i++) {
            let resultValue

            if (minValue && maxValue /* number pick */) {
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

                while (uniquenessConstraints
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

            else /* value set pick */ {

              const foundValueSet = valueSets[
                valueSetName === star
                ? Object.keys(valueSets)[Math.floor(Math.random() * valueSets.length)]
                : valueSetName
              ]

              const vidx = valueSetSetIndex === star
                ? Math.floor(Math.random() * valueValueSet.length)
                : valueSetSetIndex

              const foundValueSubSet = foundValueSet && foundValueSet.length > 0
                ? foundValueSet[vidx]
                : null

              if (foundValueSubSet) {
                if (valueSetValueIndex === star) {
                  const randomIndex = Math.floor(Math.random() * foundValueSubSet.values.length)
                  resultValue = `%%${foundValueSubSet.name}%%${vidx}%%${randomIndex}%%`
                }
                else {
                  resultValue = `%%${foundValueSubSet.name}%%${vidx}%%${valueSetValueIndex}%%`
                }
              }

              if (resultValue && uniquenessConstraintName) {
                let countIdx = 0
                const countIdxMax = 1000

                while (uniquenessConstraints
                  .find(v => v.name === uniquenessConstraintName)
                  .values.includes(resultValue)
                  && countIdx < countIdxMax) {

                  const idx   = Math.floor(Math.random() * foundValueSubSet.values.length)
                  resultValue = foundValueSubSet.values[idx]

                  countIdx++
                }

                if (countIdx == countIdxMax) {
                  resultValue = null
                }
              }
            }

            if (resultValue) {
              if (uniquenessConstraintName) {
                uniquenessConstraints
                  .find(v => v.name === uniquenessConstraintName)
                  .values
                  .push(resultValue)
              }

              resultValues.push(resultValue)
            }
          }

          if (valueSetSetIndex === star || valueSetValueIndex === star) {
            generatedValues.push([setIndex, elemIndex, resultValues])
          }

          contentElements.push(...resultValues.map(v => [setIndex, elemIndex, v]))
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

  return [
    result,
    generatedValues,
  ]
}
