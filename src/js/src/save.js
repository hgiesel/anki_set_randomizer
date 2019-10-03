const dataName = 'SRData'

export function saveData(theSaveData) {
  Persistence.removeItem(dataName)
  Persistence.setItem(dataName, theSaveData)
}

export function getData() {
  const theData = Persistence.getItem(dataName)
  return theData
}

export function createWarning() {
  const warningDiv = document.createElement('div');
  warningDiv.innerText = 'Anki-Set-Randomizer: Anki-Persistence not found!'
  warningDiv.style.cssText = 'width: 100%; height: 100%; background-color: white; color: red;';
  document.body.appendChild(warningDiv);
}
