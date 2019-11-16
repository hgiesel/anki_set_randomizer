export const processApplication = function(
  iterName, setIndex, posIndex, correspondingSets,

  styleName, styleApplications /* is modified */,
) {
  correspondingSets
    .forEach((set) => {
      if (!styleApplications.hasOwnProperty(set)) {
        styleApplications[set] = []
      }

      if (styleApplications[set][0] !== styleName /* do not apply styles more than once after another */) {
        styleApplications[set].unshift(styleName)
      }
    })
}
