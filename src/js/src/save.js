const dataName = 'SRData'

export function saveData(theSaveData) {
  Persistence.removeItem(dataName)
  Persistence.setItem(dataName, theSaveData)
}

export function getData() {
  const theData = Persistence.getItem(dataName)
  return theData
}

export function createWarningNotDefined() {
  if (!document.querySelector('#set-randomizer--warning')) {
    document.body.appendChild(getWarningDiv(
      'Set-Randomizer: Anki-Persistence is not defined!\n' +
      'Check "Tools > Set Randomizer Options" and make sure you enable "Inject anki-persistence"!'
    ));
  }
}

export function createWarningNotAvailable() {
  if (!document.querySelector('#set-randomizer--warning')) {
    document.body.appendChild(getWarningDiv(
      'Set-Randomizer: Anki-Persistence does not work in the Card Preview and Template Editor.'
    ));
  }
}

export function getWarningDiv(warningMessage) {
  const warningDiv = document.createElement('div');
  warningDiv.id = 'set-randomizer--warning'
  warningDiv.innerText = warningMessage
  warningDiv.style.cssText = (
    'width: 100%; height: 100%; ' +
    'padding: 15px 0px; ' +
    'font-size: 50%; ' +
    'background-color: white; color: red;'
  )
  return warningDiv
}

export function getNullData() {
  return [
    [/* elementsInherited */],
    [/* generatedValues */],
    [/* uniquenessConstraints */],
    [/* reordersFirst */],
    [/* reordersSecond */],
    {/* randomIndices */},
  ]
}
