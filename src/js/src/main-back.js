import formatter from './lib/formatter'
import { applyCommand } from './lib/sort'

import {
  processNumberedSets,
  processElementSharingSets,
  processOrderSharingSets,
  processCommands,
} from './lib/processor'

import generateRandomization from './lib/randomize'

if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("AnkiSetRandomizerOptions")) {
  const options = Persistence.getItem("AnkiSetRandomizerOptions")
  console.log(options)

  const form = formatter(options)
  const originalStructure = form.getOriginalStructure()

  if (originalStructure) {
    const numberedSets = processNumberedSets(originalStructure)
    const elementSharingSets = processElementSharingSets(originalStructure)
    const orderSharingSets = processElementSharingSets(originalStructure)

    const [newElements, newReorders] = generateRandomization(
      numberedSets,
      elementSharingSets,
      orderSharingSets,
      false,
    )

    //////////////////////////////////////////////////////////////////////////////
    // are applied last to first
    const commands = processCommands(originalStructure)

    const reversedCommands = commands.reverse()
    const sortedReversedCommands = [
      reversedCommands.filter(v => v[2] === 'm'),
      reversedCommands.filter(v => v[2] === 'c'),
      reversedCommands.filter(v => v[2] === 'd')
    ].flat()

    sortedReversedCommands
      .forEach(cmd => applyCommand(cmd, newElements))

    //////////////////////////////////////////////////////////////////////////////
    const lastMinuteStructure = newElements
      .map(set => set.filter(elem => elem[3] !== 'd'))

    const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure)
      .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}))

    const [lastMinuteElements, lastMinuteSetReorders] = generateRandomization(
      lastMinuteNumberedSets,
      elementSharingSets,
      orderSharingSets.filter(v => v.lastMinute),
      true,
    )

    //////////////////////////////////////////////////////////////////////////////
    form.renderSets(lastMinuteElements)
  }
}
