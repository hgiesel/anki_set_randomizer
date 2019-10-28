import {
  getCorrespondingSets,
} from './util.js'

export function getNullStyleApplications(numberedSets) {
  return numberedSets.map(_ => ['default'])
}

export function processApplication(
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

  console.log('procApp', iterName, setIndex, posIndex, styleName, correspondingSets)

  correspondingSets
    .forEach(set => {
      styleApplications[set].unshift(styleName)
    })
}
