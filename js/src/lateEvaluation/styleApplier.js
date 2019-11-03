import {
  getCorrespondingSets,
} from './util.js'

export const processApplication = function(
  iterName, setIndex, posIndex,

  styleName,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  namedSetOrYankGroup,
  nsPos,
  // kwArgs,

  numberedSets,
  namedSets,
  styleApplications /* is modified */,
) {
  const correspondingSets = getCorrespondingSets(
    numberedSets,
    namedSets,
    absolutePos,
    absolutePosFromEnd,
    setIndex,
    relativePos,
    namedSetOrYankGroup,
    nsPos,
  )

  correspondingSets
    .forEach((set) => {
      if (!styleApplications.hasOwnProperty(set)) {
        styleApplications[set] = []
      }

      styleApplications[set].unshift(styleName)
    })
}
