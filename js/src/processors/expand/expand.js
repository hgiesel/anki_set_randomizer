import {
  fromSRToken,
  isSRToken,
} from '../../util.js'

import {
  preprocessVs,
  preprocessAmount,
  preprocessPickInt,
  preprocessPickReal,
  preprocessUniq,
} from '../preprocess.js'

import {
  kwargs,
} from '../kwargs.js'

export const expand = function(
  pregenManager,
  iterName,
  setIndex,
  elemIndex,
  content,
  mode,
) {
  let result = null

  if (isSRToken(content)) {
    const pg = pregenManager.pregenChecker(iterName, setIndex, elemIndex)

    const [
      tokenName,
      ...tokens
    ] = fromSRToken(content, false)

    switch (tokenName) {
      case 'value':
        // don't need anymore evaluation
        break

      case 'pick:int':
        result = pg.expandPickNumber(
          preprocessAmount(tokens[0]),
          preprocessPickInt(tokens.slice(1, 4)),
          preprocessUniq(kwargs(tokens[4]))
        )
        break

      case 'pick:real':
        result = pg.expandPickNumber(
          preprocessAmount(tokens[0]),
          preprocessPickReal(tokens.slice(1, 4)),
          preprocessUniq(kwargs(tokens[4]))
        )
        break

      case 'pick:vs':
        result = pg.expandPickValueSet(
          preprocessAmount(tokens[0]),
          preprocessVs(tokens.slice(1, 4)),
          preprocessUniq(kwargs(tokens[4])),
        )
        break

      case 'vs': default:
        const [vsName, vsSub] = tokens
        result = pg.expandValueSet(vsName, Number(vsSub))
        break
    }
  }

  return result || [[iterName, setIndex, elemIndex, content, mode]]
}

export default expand
