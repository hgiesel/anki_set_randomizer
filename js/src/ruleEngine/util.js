import {
  pos, extract,
} from '../types.js'

const analyzeName = function(
  elements,
  yanks,
  namedSets,
  [name1, name2, name3, name4],
  evalNames,
  allowYanks,
) {
  const foundSets = namedSets
    .find(v => v.name === name1)

  if (foundSets && name2) {
    const namedPos = Number(name2)

    const idx = namedPos >= 0
      ? namedPos
      : elements.length + namedPos - 1

    return foundSets.sets[idx] >= 0
      ? [foundSets.sets[idx]]
      : []
  }

  else if (!evalNames) {
    return [name1]
  }

  else if (foundSets) {
    return foundSets.sets
  }


  else if (!allowYanks) {
    return []
  }

  else /* !foundSets => look for yanks */ {
    let foundYanks = []

    if (name1 === 'img') /* img:imageid:yankgroup:count */ {
      foundYanks = yanks

      if (name2) {
        foundYanks = foundYanks.filter(([/*yankid */, imageid]) => imageid === Number(name2))

        if (name3 && Number.isNaN(Number(name3))) {
          foundYanks = foundYanks.filter(([/*yankid */, /* imageid */, yankname]) => yankname === name3)

          if (name4) {
            const aYank = foundYanks[name4]
            foundYanks = aYank ? [aYank] : []
          }
        }

        else if (name3) {
          const aYank = foundYanks[name3]
          foundYanks = aYank ? [aYank] : []
        }
      }
    }

    else /* yankgroup:count */ {
      foundYanks = yanks.filter(([/* yankid */, /* imageid */, yankname]) => yankname === name1)

      if (name2) {
        const aYank = foundYanks[name2]
        foundYanks = aYank ? [aYank] : []
      }
    }

    const result = foundYanks.map(([yankid /*, ... */]) => `_${yankid}`)
    return result
  }
}

// evaluates named set args in $n(), $o(), or $a()
export const getCorrespondingSets = function(
  elements,
  namedSets,
  yanks,

  name,
  currentPos,

  evalNames /* evaluate a single name to its corresponding sets */,
  allowYanks /* allow names that designate yanks */,
) {
  switch (name.type) {
    /* returns [number] */
    case pos.rel:
      return [currentPos + extract(name).values]

    case pos.abs:
      return [extract(name).values]

    case pos.absNeg:
      return [elements.length + extract(name).values]

    case pos.all:
      return [...elements.keys()]

    /* returns [string] */
    case pos.absYank:
      return allowYanks
        ? [`_${extract(name).values}`]
        : []

    case pos.allYank:
      return allowYanks
        ? yanks.map(([yankid /*, ... */]) => `_${yankid}`)
        : []

    case pos.name: default:
      return analyzeName(elements, yanks, namedSets, extract(name).values, evalNames, allowYanks)
  }
}
