export const vsSome = 'vsSome'
export const vsNone = 'vsNone'
export const vsStar = 'vsStar'
export const vsSelf = 'vsSelf'

export const pickInt = 'pickInt'
export const pickReal = 'pickReal'

export const typeRel = 'typeReal'

export const typeAbs = 'typeAbs'
export const typeAbsYank = 'typeAbsYank'
export const typeAbsNeg = 'typeAbsNeg'

export const typeAll = 'typeAll'
export const typeAllYank = 'typeAllYank'
export const typeName = 'typeName'

export const amountCount = 'amountCount'
export const amountStar = 'amountStar'
export const amountPlus = 'amountPlus'
export const amountQuestion = 'amountQuestion'

export const uniqSome = 'uniqSome'
export const uniqCond = 'uniqCond'
export const uniqNone = 'uniqNone'

export const vsSerialize = function(component) {
  return component === vsSelf
    ? '_'
    : component === vsStar
    ? '*'
    : component
}

export const isSRToken = function(token, name = '') {
  return token.startsWith(`%%sr%%${name}`)
}

export const fromSRToken = function(token, dropFirst = true) {
  return token
    .split('%%')
    .slice(dropFirst ? 3 : 2, -1)
}

export const toSRToken = function(components) {
  return `%%sr%%${components.join('%%')}%%`
}

const getWarningDiv = function(warningMessage) {
  const warningDiv = document.createElement('div')
  warningDiv.id = 'set-randomizer--warning'
  warningDiv.innerHTML = warningMessage
  warningDiv.style.cssText = (
    'color: firebrick;'
    + 'font-size: 40%; '
    + 'background-color: white; '
    + 'border: 2px solid red; '
    + 'margin: 40px 10px 0px; '
    + 'padding: 15px; '
    + 'text-shadow: 0px 0px; ' /* avoid text-shadow from somewhere else */
  )

  return warningDiv
}

const createWarningNotDefined = function() {
  document.body
    .querySelector('#qa')
    .appendChild(getWarningDiv('Set-Randomizer:'
      + 'Anki-Persistence is not defined!\n'
      + 'Check "Tools > Set Randomizer Options" and make sure you enable "Inject anki-persistence".'))
}

const createWarningNotAvailable = function() {
  document.body
    .querySelector('#qa')
    .appendChild(getWarningDiv('Set-Randomizer:'
      + 'Anki-Persistence <a href="https://github.com/SimonLammer/anki-persistence">does not work here</a>.'
      + 'Randomization will be inconsistent.'))
}

export const createWarnings = function(wereSetsUsed) {
  if (!document.querySelector('#set-randomizer--warning')) {
    if (!window.Persistence) {
      createWarningNotDefined()
    }

    else if (!Persistence.isAvailable() && wereSetsUsed) {
      // only show Warning if you used some sets at all
      createWarningNotAvailable()
    }
  }
}
