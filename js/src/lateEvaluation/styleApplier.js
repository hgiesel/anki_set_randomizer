export const processApplication = function(
  iterName, setIndex, posIndex, correspondingSets,

  styleName, styleApplications /* is modified */,
) {
  correspondingSets
    .forEach((set) => {
      if (!styleApplications.hasOwnProperty(set)) {
        styleApplications[set] = []
      }

      styleApplications[set].unshift(styleName)
    })
}
