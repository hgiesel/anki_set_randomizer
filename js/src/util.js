export const star = {"star": true}

export function createWarnings(wereSetsUsed) {
  if (!document.querySelector('#set-randomizer--warning')) {
    if (!window.Persistence) {
      createWarningNotDefined()
    }
    else if (!Persistence.isAvailable() && wereSetsUsed /* only show Warning if you used some sets at all */) {
      createWarningNotAvailable()
    }
  }
}

function createWarningNotDefined() {
  document.body.querySelector('#qa').appendChild(getWarningDiv(
    'Set-Randomizer: Anki-Persistence is not defined!\n' +
    'Check "Tools > Set Randomizer Options" and make sure you enable "Inject anki-persistence".'
  ));
}

function createWarningNotAvailable() {
  document.body.querySelector('#qa').appendChild(getWarningDiv(
    'Set-Randomizer: Anki-Persistence <a href="https://github.com/SimonLammer/anki-persistence">does not work here</a>. Randomization will be inconsistent.'
  ));
}

function getWarningDiv(warningMessage) {
  const warningDiv = document.createElement('div');
  warningDiv.id = 'set-randomizer--warning'
  warningDiv.innerHTML = warningMessage
  warningDiv.style.cssText = (
    'color: firebrick;' +
    'font-size: 40%; ' +
    'background-color: white; ' +
    'border: 2px solid red; ' +
    'margin: 40px 10px 0px; ' +
    'padding: 15px; ' +
    'text-shadow: 0px 0px; ' /* avoid text-shadow from somewhere else */
  )

  return warningDiv
}
