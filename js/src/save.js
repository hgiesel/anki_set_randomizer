const dataName = 'SRData'

export function saveData(theSaveData, wereSetsUsed) {
  if (window.Persistence && Persistence.isAvailable()) {
    Persistence.removeItem(dataName)
    Persistence.setItem(dataName, theSaveData)
  }
}

export function getData() {
  if (window.Persistence && Persistence.isAvailable()) {
    const theData = Persistence.getItem(dataName)

  return theData
    ? theData
    : getNullData()
  }

  return getNullData()
}

function getNullData() {
  return [
    [/* elementsInherited */],
    [/* generatedValues */],
    [/* uniquenessConstraints */],
    [/* reordersFirst */],
    [/* reordersSecond */],
    {/* randomIndices */},
  ]
}
