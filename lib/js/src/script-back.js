const elems = ['a', 'b', 'c', 'd', '5']
const indices = [7,0,6,1,5,2,4,3]

const sort = require('./src/sort.js')

const elems2 = [['a','b','c'], ['u','v'], ['x','y','z']]
const lengths2 = elems2.map(v => v.length)

console.log(sliceWithLengths(sort.sortByIndices(elems2.flat(), indices), elems2.map(v => v.length)))

function processCommands(sets) {
  const result = []

  const idxPart = '^\\^(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?)(?::(\\d))?'
  const copyRegex   = new Regex(`${idxPart}(?:~(?:(\d+))?)?$`, 'gm')
  const moveRegex   = new Regex(`${idxPart}+(?:(\d+))?$`, 'gm')
  const deleteRegex = new Regex(`${idxPart}-(?:(\d+))?$`, 'gm')

  function processGroupName() {
    // sets.length
    // TODO
  }

  function processGroupPosition() {
    // TODO
  }

  for (const set of sets) {
    for (const elem of set) {

      if (copyRegexResult = copyRegex.exec(elem[2])) {
        const fromGroupName     = processGroupName(copyRegexResult[1], i)
        const fromGroupPosition = processGroupPosition(copyRegexResult[2] || 0)
        const fromGroupAmount   = copyRegexResult[3] || 999

        result.unshift([elem[0], elem[1], 'c', fromGroupName, fromGroupPosition, fromGroupAmount])
      }

      else if (moveRegexResult = moveRegex.exec(elem[2])) {
        const fromGroup = copyRegexResult[1]
        result.unshift([elem[0], elem[1], 'm', fromGroupName, fromGroupPosition, fromGroupAmount])
      }

      else if (deleteRegexResult = deleteRegex.exec(elem[2])) {
        const fromGroup = copyRegexResult[1]
        result.unshift([elem[0], elem[1], 'd', fromGroupName, fromGroupPosition, fromGroupAmount])
      }
    }
  }

  return result
}
