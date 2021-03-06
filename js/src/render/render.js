import {
  renderSets,
} from './renderSets.js'

import {
  renderOcclusion,
} from './occlude.js'

const styleAccessor = function(styleDefinitions, styleApplications, randomIndices = []) {
  const importIndices = function() {
    styleDefinitions
      .forEach((def) => {
        ['colors', 'classes'].forEach((type) => {
          def.stylings[type].randomIndices = randomIndices[def.name]
            ? randomIndices[def.name][type]
            : []
          def.stylings[type].nextIndex = 0
        })
      })
  }

  importIndices()

  const propAccessor = function(lookupName) {
    const appliedStyleNames = styleApplications[lookupName]
      ? styleApplications[lookupName].concat(['default'])
      : ['default']

    const styles = appliedStyleNames
      .flatMap((name) => {
        const maybeStyle = styleDefinitions
          .find(s => s.name === name)

        return maybeStyle
          ? maybeStyle.stylings
          : []
      })

    /* safenav */
    const getProp = function(props, preds = [], defaultValue = null) {
      const nothing = {}
      const access = (record, prop) => {
        if (Object.is(record, nothing)) {
          return nothing
        }

        try {
          switch (typeof prop) {
            case 'number':
              return prop < record.length
                ? record[prop]
                : nothing

            case 'string':
              return prop in record
                ? record[prop]
                : nothing

            default:
              return record[prop]
          }
        }

        catch (e) {
          return nothing
        }
      }

      const result = styles.reduce((foundRecord, record) => {
        if (Object.is(foundRecord, nothing)) {
          const preresult = props.reduce(access, record)

          return preds.reduce((shortcutValue, pred) => (
            shortcutValue && pred(preresult)
          ), true)
            ? preresult
            : nothing
        }

        return foundRecord
      }, nothing)

      return Object.is(result, nothing)
        ? defaultValue
        : result
    }

    let currentIndex = null

    const getNextIndex = function(type /* colors or classes */) {
      let theIndex = null
      const theProp = getProp([type])
      const propValueLength = getProp([type, 'values'], [/* preds */], [/* default */]).length

      if (propValueLength === 0 || Number.isNaN(theProp.next)) {
        theIndex = NaN
      }

      else if (typeof currentIndex === 'number') {
        theIndex = ++currentIndex % propValueLength
      }

      else if (theProp.collectiveIndexing && theProp.randomStartIndex) {
        if (theProp.randomIndices.length === 0) {
          theIndex = Math.floor(Math.random() * propValueLength)
          theProp.randomIndices.push(theIndex)
        }
        else {
          theIndex = theProp.nextIndex === 0
            ? theProp.randomIndices[0]
            : theProp.nextIndex % propValueLength
        }
      }

      else if (theProp.collectiveIndexing) {
        theIndex = theProp.nextIndex % propValueLength
      }

      else if (theProp.randomStartIndex) {
        if (!theProp.setIndex) {
          theProp.setIndex = 0
        }

        theIndex = theProp.randomIndices[theProp.setIndex]

        if (typeof theIndex !== 'number') {
          theIndex = Math.floor(Math.random() * propValueLength)
          theProp.randomIndices.push(theIndex)
        }

        theProp.setIndex += 1
      }

      else {
        theIndex = 0
      }

      currentIndex = theIndex
      theProp.nextIndex = currentIndex + 1

      return theIndex
    }

    return {
      getProp: getProp,
      getNextIndex: getNextIndex,
    }
  }

  const exportIndices = function() {
    const result = {}

    styleDefinitions
      .forEach((def) => {
        result[def.name] = {}

        ;['colors', 'classes'].forEach((type) => {
          result[def.name][type] = def.stylings[type].randomIndices
        })
      })

    return result
  }

  return {
    propAccessor: propAccessor,
    exportIndices: exportIndices,
  }
}

export const render = function(
  form,
  reordering,
  valueSets,
  occlusions,

  styleDefinitions,
  styleApplications,
  randomIndicesInherited,

  elementsToShuffle,
) {
  const sa = styleAccessor(styleDefinitions, styleApplications, randomIndicesInherited)

  const stylizedResults = renderSets(
    reordering,
    valueSets,
    sa,
    elementsToShuffle,
  )

  form.outputSets(stylizedResults)

  // order is important!
  // outputSets requires that underlying html doesn't change length
  // however renderOcclusion does just that
  const events = renderOcclusion(form.getHtml(), occlusions, sa)

  return [
    events,
    sa.exportIndices(),
  ]
}

export default render
