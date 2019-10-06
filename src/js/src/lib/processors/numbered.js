import {
  namePattern,
  positionPattern,
  star,
} from './util.js'

function generateRandomValue(min, max, extra, isReal) {
  const preValue = Math.random() * (max - min) + min

  return isReal
    ? preValue.toFixed(extra || 2)
    : (Math.round(preValue) * (extra || 1)).toString()
}

function generateValue(name, subsetIndex, valueIndex) {
  return `%%${name}%%${subsetIndex}%%${valueIndex}%%`
}

// also processes generator patterns
export function processNumberedSets(
  elements,
  generatedValues,
  uniquenessConstraints0,
  iterIndexCurr,
  lastMinutes=[],
) {

  const [
    evaluators,
  ] = evalEvaluations(elements)

  const [
    valueSets,
    valueSetEvaluations,
    uniquenessConstraints1,
  ] = evalValueSets(elements, evaluators, uniquenessConstraints0)

  console.log('vse', valueSetEvaluations)

  const [
    result,
    uniquenessConstraints2,
  ] = evalPicks(elements, valueSets, valueSetEvaluations, uniquenessConstraints1, generatedValues, iterIndexCurr, lastMinutes)

  return [result, generatedValues, uniquenessConstraints2, valueSets]
}

function evalEvaluations(elements) {
  const evaluators = []

  const evaluatorPattern = new RegExp(
    `^\\$(?:evaluate|eval|e)\\(` +
    `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
    `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
    `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
  )

  for (const elem of elements.flat()) {
    let match

    const theElem = elem[3]

    // evaluations
    if (match = theElem.match(evaluatorPattern)) {

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

function evalValueSets(elements, evaluators, uniquenessConstraints) {
  const valueSets = {}
  const valueSetEvaluations = []

  const valueSetPattern = new RegExp(
    `^\\$(${namePattern})(!)?(?!\\()(\\W)((?:.|\\n|\\r)*)`
  )

  const valueSetTokens = '(?:\'((?:.|\\n|\\r)*?[^\\\\])\'|"((?:.|\\n|\\r)*?[^\\\\])")'

  // modifies evaluators !!!!!
  evaluators.reverse()

  // get value sets
  const singleQuotePattern = new RegExp(`\\\\'`, 'g')
  const doubleQuotePattern = new RegExp(`\\\\"`, 'g')
  const newLinePattern = new RegExp(`\\\\n`, 'g')
  const catchPattern = new RegExp(`\\\\.`, 'g')

  for (const elem of elements.flat()) {
    let match

    const [
      iterIndex,
      setIndex,
      elemIndex,
      theElem,
    ] = elem

    // value set shortcut
    if (match = theElem.match(valueSetPattern)) {

      const valueSetName     = match[1]
      const isSelfEvaluating = match[2] === '!' ? true : false

      const values = match[4]
        .replace(`\\${match[3]}`, '%%sr%%ESCDELIM%%')
        .replace(newLinePattern, '<br/>')
        .replace(catchPattern, (x) => x.slice(1))
        .split(match[3])
        .map(v => v.replace('%%sr%%ESCDELIM%%', match[3]))

      const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
        name: valueSetName,
        idx: valueSets[valueSetName] ? valueSets[valueSetName].length : 0,
        values: values,
        iter: iterIndex,
        set: setIndex,
        pos: elemIndex,
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

          let theValue = generateValue(
            valueSetName,
            valueSetIndex,
            foundEvaluator[2] !== star ? foundEvaluator[2] : Math.floor(Math.random() * values.length),
          )

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

              theValue = generateValue(
                valueSetName,
                valueSetIndex,
                Math.floor(Math.random() * values.length),
              )

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
          idx => generateValue(
            valueSetName,
            valueSetIndex,
            idx
          ),
        ))
      }

      if (resolvedValues.length > 0) {
        valueSetEvaluations.push([
          setIndex,
          elemIndex,
          resolvedValues,
          wasStar,
        ])
      }
    }
  }

  return [
    valueSets,
    valueSetEvaluations,
    uniquenessConstraints,
  ]
}

function evalPicks(
  elements,
  valueSets,
  valueSetEvaluations,
  uniquenessConstraints,
  generatedValues,
  iterIndex,
  lastMinutes,
) {

  const result = []
  const lastMinutePattern = new RegExp(`^\\$(n|name)!\\(\\)$`)

  const intPattern       = '\\d+'
  const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`
  const realIntGenerator =
    `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`

  const pickPattern = new RegExp(
    `^\\$(?:pick|p)\\(` +
    `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
    `(?:${realIntGenerator}|` +
    `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)?)` + // picking from value sets
    `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
  )

  const contentElementPattern = new RegExp('^[^\\$]')

  for (const [i, set] of elements.entries()) {

    const contentElements = []
    let lastMinute = lastMinutes[i] || false

    for (const elem of set) {

      let match

      const [
        iterIndex,
        setIndex,
        elemIndex,
        theElem,
      ] = elem

      if (!lastMinute && lastMinutePattern.test(theElem)) {
        lastMinute = true
      }

      else if (match = valueSetEvaluations.find(v => v[0] === setIndex && v[1] === elemIndex)) {

        let theElements
        let maybePregeneratedValue

        if (maybePregeneratedValue = generatedValues
          .find(w => w[0] === setIndex && w[1] === elemIndex)) {
          theElements = maybePregeneratedValue[3]
        }
        else {
          theElements = match[3]

          if (match[4]) {
            generatedValues.push([iterIndex, setIndex, elemIndex, match[2]])
          }
        }

        contentElements.push(...theElements.map(w => [iterIndex, setIndex, elemIndex, w]))
      }

      else if (match = theElem.match(pickPattern)) {

        const count =
          match[1] !== undefined
          ? Number(match[1]) : 1

        const uniquenessConstraintName = match[10]

        const minValue   = match[2]
        const maxValue   = match[3]
        const extraValue = match[4]

        const valueSetName = match[5]

        const maybeValueSetSetIndex   = Number(match[6])
        const maybeValueSetValueIndex = Number(match[8])

        const valueSetNameName = valueSetName === '*'
          ? star
          : valueSetName

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
        const theUc = uniquenessConstraints
          .find(v => v.name === uniquenessConstraintName)


        console.log('gv', generatedValues)
        let maybePregeneratedValue
        if (maybePregeneratedValue = generatedValues
          .find(v =>
            v[0] === iterIndex &&
            v[1] === setIndex &&
            v[2] === elemIndex)) {

          resultValues.push(...maybePregeneratedValue[3])
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

              /* dealing with uc */
              if (theUc) {
                let countIdx = 0
                const countIdxMax = 1000

                while (theUc.values.includes(resultValue) &&
                countIdx < countIdxMax) {

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
                valueSetNameName === star
                ? Object.keys(valueSets)[Math.floor(Math.random() * valueSets.length)]
                : valueSetNameName
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
                  resultValue = generateValue(foundValueSubSet.name, vidx, randomIndex)
                }
                else {
                  resultValue = generateValue(foundValueSubSet.name, vidx, valueSetValueIndex)
                }
              }

              /* dealing with uc */
              if (resultValue && theUc) {
                let countIdx = 0
                const countIdxMax = 1000

                while (theUc.values.includes(resultValue) && countIdx < countIdxMax) {

                  const randomIndex = Math.floor(Math.random() * foundValueSubSet.values.length)
                  resultValue = generateValue(foundValueSubSet.name, vidx, randomIndex)

                  countIdx++
                }

                if (countIdx == countIdxMax) {
                  resultValue = null
                }
              }
            }

            /* adding to resultValues */
            if (resultValue !== undefined && resultValue !== null) {

              if (theUc) {
                theUc.values.push(resultValue)
              }

              resultValues.push(resultValue)
            }
          }

          if (resultValues.length > 0 && (valueSetNameName === star || valueSetSetIndex === star || valueSetValueIndex === star)) {
            generatedValues.push([iterIndex, setIndex, elemIndex, resultValues])
          }
        }

        contentElements.push(...resultValues.map(v => [iterIndex, setIndex, elemIndex, v]))
      }

      else if (contentElementPattern.test(theElem) || theElem.length === 0) {
        contentElements.push(elem)
      }
    }

    result.push({
      iter: iterIndex,
      name: i,
      elements: contentElements,
      lastMinute: lastMinute,
    })
  }

  return [
    result,
    uniquenessConstraints,
  ]
}
