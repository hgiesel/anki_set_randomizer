const elems = ['a', 'b', 'c', 'd', '5']
const indices = [7,0,6,1,5,2,4,3]

function sortByIndices(elems, indices) {
  var result = []

  for (i of indices) {
    if (elems[i]) {
      result.push(elems[i])
    }
  }

  if (indices.length < elems.length) {
      for (i of Array.from(new Array(elems.length - indices.length), (x, i) => i + indices.length)) {
        result.push(elems[i])
      }
  }

  return result
}

/////////////////////////////////

const elems2 = [['a','b','c'], ['u','v'], ['x','y','z']]
const lengths2 = elems2.map(v => v.length)

function sliceWithLengths(elems, lengths) {
  var result = []

  var startIndex = 0
  for (l of lengths) {
    result.push(elems.slice(startIndex, startIndex + l))
    startIndex += l
  }

  return result
}

console.log(sliceWithLengths(sortByIndices(elems2.flat(), indices), elems2.map(v => v.length)))


//////////////////////////////////
//

function processCommands(sets) {
  const result = []

  var idxPart = '^\\^(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?)(?::(\\d))?'
  var copyRegex   = new Regex(`${idxPart}(?:~(?:(\d+))?)?$`, 'gm')
  var moveRegex   = new Regex(`${idxPart}+(?:(\d+))?$`, 'gm')
  var deleteRegex = new Regex(`${idxPart}-(?:(\d+))?$`, 'gm')

  function processGroupName() {
    sets.length
    // TODO
  }

  function processGroupPosition() {
    // TODO
  }

  for (set of sets) {
    for (elem of set) {

      if (copyRegexResult = copyRegex.exec(elem[2])) {
        var fromGroupName     = processGroupName(copyRegexResult[1], i)
        var fromGroupPosition = processGroupPosition(copyRegexResult[2] || 0)
        var fromGroupAmount   = copyRegexResult[3] || 999

        result.unshift([elem[0], elem[1], 'c', fromGroupName, fromGroupPosition, fromGroupAmount)
      }

      else if (moveRegexResult = moveRegex.exec(elem[2])) {
        var fromGroup = copyRegexResult[1]
        result.unshift([elem[0], elem[1], 'm', fromGroupName, fromGroupPosition, fromGroupAmount)
      }

      else if (deleteRegexResult = deleteRegex.exec(elem[2])) {
        var fromGroup = copyRegexResult[1]
        result.unshift([elem[0], elem[1], 'd', fromGroupName, fromGroupPosition, fromGroupAmount)
      }
    }
  }

  return result
}
