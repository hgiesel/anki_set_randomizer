const dataName = 'SRData'

const getNullData = function() {
  return [
    [/* elementsInherited */],
    [/* generatedValues */],
    [/* uniquenessConstraints */],
    [/* reordersFirst */],
    [/* reordersSecond */],
    {/* randomIndices */},
  ]
}

export const saveData = function(theSaveData) {
  if (window.Persistence && Persistence.isAvailable()) {
    Persistence.removeItem(dataName)
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
