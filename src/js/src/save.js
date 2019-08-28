const dataName = 'SRData'

export function saveData(theSaveData) {
  Persistence.removeItem(dataName)
  Persistence.setItem(dataName, theSaveData)
}

export function getData() {
  const theData = Persistence.getItem(dataName)
  return theData
}
