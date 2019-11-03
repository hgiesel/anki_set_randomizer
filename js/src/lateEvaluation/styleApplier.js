import {
  getCorrespondingSets,
} from './util.js'

export const processApplication = function(
  iterName, setIndex, posIndex,

  styleName, name,

  numberedSets,
  namedSets,
  styleApplications /* is modified */,
) {
  const correspondingSets = getCorrespondingSets(
    numberedSets,
    namedSets,
    name,
    setIndex,
  )

  correspondingSets
    .forEach((set) => {
      if (!styleApplications.hasOwnProperty(set)) {
        styleApplications[set] = []
      }

      styleApplications[set].unshift(styleName)
    })
}
