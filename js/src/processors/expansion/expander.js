import {
  elem,
  pick,
  extract,
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
      case elem.text:
        return [[iterName, setIndex, elemIndex, content, mode]]

      case elem.vs:
        const vs = extract(content)
        return pg.expandValueSet(content.name, content.sub)

      case elem.pick: default:
        const picked = extract(content)
        const picker = picked.pick.type === pick.int
          ? pg.expandPickInt
          : picked.pick.type === pick.real
          ? pg.expandPickReal
          : pg.expandPickValueSet

        return picker(
          picked.amount,
          extract(picked.pick),
          picked.uniq,
        )
    }
  }

  return {
    expand: expand,
  }
}

export default expander
