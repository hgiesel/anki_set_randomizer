import {
  elemText, elemVs, elemPick,
  pickInt, pickReal,
} from '../../types.js'

export const expander = function(pregenManager) {
  const expand = function([
    iterName,
    setIndex,
    elemIndex,
    content,
    mode,
  ]) {
    const pg = pregenManager.pregenChecker(iterName, setIndex, elemIndex)

    switch (content.type) {
      case elemText:
        return [[iterName, setIndex, elemIndex, content, mode]]

      case elemVs:
        return pg.expandValueSet(content.name, content.sub)

      case elemPick: default:
        switch (content.pick.type) {
          case pickInt:
            return pg.expandPickNumber(
              content.pick.amount,
              content.pick.pick,
              content.pick.uniq,
            )

          case pickReal:
            return pg.expandPickNumber(
              content.pick.amount,
              content.pick.pick,
              content.pick.uniq,
            )

          default /* from vs */:
            return pg.expandPickValueSet(
              content.pick.amount,
              content.pick.pick,
              content.pick.uniq,
            )
        }
    }
  }

  return {
    expand: expand,
  }
}

export default expander
