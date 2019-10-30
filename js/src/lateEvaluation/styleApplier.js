import {
  getCorrespondingSets,
} from './util.js'

export const getNullStyleApplications = function(numberedSets) {
  return numberedSets.map(() => ['default'])
}

export const processApplication = function(
  iterName, setIndex, posIndex,

  styleName,
  absolutePos,
  absolutePosFromEnd,
  relativePos,
  namedSet,
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
    namedSet,
    nsPos,
  )

  correspondingSets
    .forEach((set) => {
      styleApplications[set].unshift(styleName)
    })
}
