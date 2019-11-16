const dataName = 'SRData'

export const getNullData = function() {
  return [
    [/* elements */],
    [/* generatedValues */],
    [/* uniquenessConstraints */],

    {/* setToShuffleMap */},
    [/* shuffles */],
    [/* orders */],

    {/* randomIndices */},
  ]
}

export const saveData = function(theSaveData) {
  if (window.Persistence && Persistence.isAvailable()) {
    Persistence.setItem(dataName, theSaveData)
  }
}

export const getData = function() {
  if (window.Persistence && Persistence.isAvailable()) {
    const theData = Persistence.getItem(dataName)

    return theData
      ? theData
      : getNullData()
  }

  return getNullData()
}
