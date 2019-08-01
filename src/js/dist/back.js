(function () {
  'use strict';

  function escapeString(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * For all funtions that concerns accessing the html content
   */

  function formatter(options) {

    let _rawStructure;

    const getRawStructure = function() {
      if (_rawStructure) {
        return _rawStructure
      }

      else {
        const theElement = document.querySelector(options.query);
        const theBody = theElement ? theElement.innerHTML : '';

        const rawStructure = [];

        const exprRegex = RegExp(
          `${escapeString(options.inputSyntax.openDelim)}(?:::)?(.*?)(?:::)?${escapeString(options.inputSyntax.closeDelim)}`,
          'gm'
        );

        let m = exprRegex.exec(theBody);
        while (m) {
          rawStructure.push(m[1]);
          m = exprRegex.exec(theBody);
        }

        return _rawStructure = rawStructure
      }
    };

    const getOriginalStructure = function() {
      const splitResults = [];

      for (const [i, group] of getRawStructure().entries()) {
        const splitGroup = group
          .split(options.inputSyntax.fieldSeparator)
          .map((v, j) => [i, j, v]);

        splitResults.push(splitGroup);
      }

      return splitResults
    };

    const renderSets = function(reordering) {

      let absoluteIndex = 0 + (options.colors_random_start_index ? Math.floor(Math.random() * options.colors.length) : 0);

      const stylizedResults = Array(reordering.length);
      for (const set of reordering) {

        const actualValues = [];

        const randomStartIndex = (options.colors_random_start_index ? Math.floor(Math.random() * options.colors.length) : 0);

        for (const [i, element] of set.rendering.entries()) {
          if (element[3] !== 'd') {
            const theIndex    = ((options.colors_collective_indexing ? absoluteIndex++ : randomStartIndex + i) % options.colors.length);

            const className   = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`;

            const colorChoice = options.colors[theIndex] ? ` color: ${options.colors[theIndex]};` : '';
            const style       = `style="padding: 0px ${options.fieldPadding}px;${colorChoice}"`;

            actualValues.push(`<span ${className} ${style}>${element[2]}</span>`);
          }
        }

        stylizedResults[set.order] = (actualValues.join(options.outputSyntax.fieldSeparator));
      }

      const theElement = document.querySelector(options.query);
      let replacement = theElement ? theElement.innerHTML : '';

      for (const [i, v] of getRawStructure().entries()) {
        replacement = replacement
          .replace(
            `${options.inputSyntax.openDelim}${v}${options.inputSyntax.closeDelim}`,
            `${options.outputSyntax.openDelim}${stylizedResults[i]}${options.outputSyntax.closeDelim}`
          );
      }

      document.querySelector(options.query).innerHTML = replacement;
    };

    return {
      getRawStructure: getRawStructure,
      getOriginalStructure: getOriginalStructure,
      renderSets: renderSets,
    }
  }

  function sortWithIndices(elems, indices) {
    const result = [];

    for (const idx of indices) {
      const maybeElem = elems[idx];

      if (maybeElem) {
        result.push(maybeElem);
      }
    }

    if (indices.length < elems.length) {
        for (const idx of Array.from(new Array(elems.length - indices.length), (x, i) => i + indices.length)) {
          result.push(elems[idx]);
        }
    }

    return result
  }

  function sliceWithLengths(elems, lengths) {
    const result = [];

    let startIndex = 0;
    for (const l of lengths) {
      result.push(elems.slice(startIndex, startIndex + l));
      startIndex += l;
    }

    return result
  }

  function applySetReorder(sr, elems, elemsOrig) {
    switch (typeof sr.name) {
      case 'number':
        const saveElems = elemsOrig[sr.name];
        elems[sr.name] = sortWithIndices(saveElems, sr.order);
        break

      case 'string':
        const flatSaveElems = sr.sets.map(v => elemsOrig[v]).flat();
        sliceWithLengths(sortWithIndices(flatSaveElems, sr.order), sr.setLengths)
          .forEach((v, i) => {
            elems[sr.sets[i]] = v;
          });
        break
    }
  }

  // cmd = [0:toSet, 1:toPosition, 2:cmdName, 3:fromSet, 4:fromPosition, 5:amount]
  function applyCommand(cmd, elems) {

    const saveElems = elems[cmd[3]]
      .filter(v => v[3] === 'n')
      .slice(cmd[4], cmd[4] + cmd[5]);

    if (cmd[2] === 'd' || cmd[2] === 'm') {
      elems[cmd[3]].splice(cmd[4], cmd[5], ...saveElems.map(v => [v[0], v[1], v[2], 'd']));
    }

    if (cmd[2] === 'c' || cmd[2] === 'm') {
      elems[cmd[0]].splice(cmd[1], 0, ...saveElems.map(v => [v[0], v[1], v[2], cmd[2]]));
    }
  }

  function processNumberedSets(originalStructure) {
    const numberedSets = [];

    const lastMinutePattern     = new RegExp('^\\^!!?$');
    const contentElementPattern = new RegExp('^[^\\^]');

    for (const [i, set] of originalStructure.entries()) {

      const contentElements = [];
      let lastMinute = false;

      for (const elem of set) {

        if (lastMinutePattern.test(elem[2])) {
          lastMinute = true;
        }

        else if (contentElementPattern.test(elem[2])) {
          contentElements.push(elem);
        }
      }

      numberedSets.push({
        name: i,
        elements: contentElements,
        lastMinute: lastMinute,
      });
    }

    return numberedSets
  }

  function processElementSharingSets(originalStructure) {
    const elementSharingSets = [];

    const maybeSharedOrderPattern = '(?:[a-zA-Z]+\\?\\??)?';
    const namedSetPattern   = `^\\^([a-zA-Z]+)!!?${maybeSharedOrderPattern}$`;
    const lastMinutePattern = new RegExp(`^\\^.*!!${maybeSharedOrderPattern}$`);

    for (const elem of originalStructure.flat()) {

      let patternResult;

      if (patternResult = new RegExp(namedSetPattern).exec(elem[2])){

        const correspondingNumberedSet = elem[0];

        if (elementSharingSets.filter(v => v.name === patternResult[1]).length === 0) {
          elementSharingSets.push({
            name: patternResult[1],
            lastMinute: false,
            sets: [correspondingNumberedSet]
          });
        }

        else {
          elementSharingSets.filter(v => v.name === patternResult[1])[0].sets.push(correspondingNumberedSet);
        }

        if (lastMinutePattern.test(elem[2])) {
          elementSharingSets.filter(v => v.name === patternResult[1])[0].lastMinute = true;
        }
      }
    }

    return elementSharingSets
  }

  function processIndex(index, currentIndex, elemCount) {
    const absolutePositionFromEndPattern  = '^n(-\\d+)?$';
    const absolutePosition                = '^\\d+$';
    const posiitveRelativePositionPattern = '^\\+(\\d+)$';
    const negativeRelativePositionPattern = '^-(\\d+)$';

    let patternResult;

    if (patternResult = new RegExp(posiitveRelativePositionPattern).exec(index)) {
      return currentIndex + Number(patternResult[1])
    }
    else if (patternResult = new RegExp(negativeRelativePositionPattern).exec(index)) {
      return currentIndex - Number(patternResult[1])
    }

    else if (patternResult = new RegExp(absolutePositionFromEndPattern).exec(index)) {
      return elemCount - (Number(patternResult[1]) || 0) - 1
    }
    else if (patternResult = new RegExp(absolutePosition).exec(index)) {
      return Number(index)
    }
    else {
      return index
    }
  }

  function processCommands(originalStructure) {
    const result = [];

    const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|[a-zA-Z]+)';
    const positionPattern = '(?::(\\d+|n(?:-\\d+)?))?';
    const amountPattern   = '(?:(\\d+))?';

    const copySymbol    = '=';
    const copyPattern   = `^\\^${idxPattern}${positionPattern}${copySymbol}${amountPattern}$`;

    const moveSymbol    = '\\~';
    const movePattern   = `^\\^${idxPattern}${positionPattern}${moveSymbol}${amountPattern}$`;

    const deleteSymbol  = '\\%';
    const deletePattern = `^\\^${idxPattern}${positionPattern}${deleteSymbol}${amountPattern}$`;

    for (const set of originalStructure) {
      for (const elem of set) {

        const toSetName     = elem[0];
        const toSetPosition = elem[1];

        let patternResult;
        let commandType;

        if (patternResult = new RegExp(copyPattern, 'gm').exec(elem[2])) {
          commandType = 'c';
        }
        else if (patternResult = new RegExp(movePattern, 'gm').exec(elem[2])) {
          commandType = 'm';
        }
        else if (patternResult = new RegExp(deletePattern, 'gm').exec(elem[2])) {
          commandType = 'd';
        }

        if (commandType) {
          const fromSetName     = processIndex(patternResult[1], toSetName, originalStructure.length);
          const fromSetPosition = processIndex(patternResult[2] || 0, toSetPosition, set.length);
          const fromSetAmount   = Number(patternResult[3]) || 999;
          result.push([toSetName, toSetPosition, commandType, fromSetName, fromSetPosition, fromSetAmount]);
        }
      }
    }

    return result
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex   = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue      = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex]  = temporaryValue;
    }
    return array;
  }

  function reorderNumberedSets(numberedSets) {
    return numberedSets.map(v => ({
      name: v.name,
      length: v.elements.length,
      order: shuffle([...new Array(v.elements.length).keys()]),
      lastMinute: v.lastMinute,
    }))
  }

  function reorderElementSharingSets(elementSharingSets, numberedSets) {
    return elementSharingSets.map(v => {

      const containedNumberedSets = v.sets
        .map(v => numberedSets.filter(u => u.name === v));

      const setLengths = containedNumberedSets
        .map(v => v[0].elements.length);

      const elementCount = setLengths
        .reduce((accu, w) => accu + w, 0);

      return {
        name: v.name,
        length: elementCount,
        sets: v.sets,
        setLengths: setLengths,
        order: shuffle([...new Array(elementCount).keys()]),
        lastMinute: v.lastMinute,
      }
    })
  }

  function detectOrderDictator(orderSharingSet, setReorders) {
    return orderSharingSet.sets.map(v => ({
      name: v,
      length: setReorders.filter(w => w.name === v)[0].length
    })).reduce((accu, v) => accu.length < v.length ? v : accu).name
  }

  function applySharedOrder(orderSharingSet, setReorders) {
    const dictator = detectOrderDictator(orderSharingSet, setReorders);
    const dictatorOrder = setReorders.filter(v => v.name === dictator)[0].order;

    for (const set of orderSharingSet.sets) {
      const oldOrder = setReorders.filter(v => v.name === set)[0].order;
      const newOrder = dictatorOrder.filter(v => v < oldOrder.length);
      setReorders.forEach(v => {
        if (v.name === set) {
          v.order = newOrder;
        }
      });
    }

    return setReorders
  }

  function generateRandomization(numberedSets, elementSharingSets, orderSharingSets, lastMinute) {
    const elements = numberedSets
      .map(v => v.elements)
      .map(v => v.map(u => [u[0], u[1], u[2], 'n']));

    const elementsCopy = JSON.parse(JSON.stringify(elements));
    const setReorders = [
      reorderNumberedSets(numberedSets),
      reorderElementSharingSets(elementSharingSets, numberedSets),
    ].flat();

    // modifies setReorders (!)
    orderSharingSets.forEach(oss => applySharedOrder(oss, setReorders));

    // numbered are sorted 0 -> n, then named are in order of appearance
    // modifies elementsCopy (!)
    setReorders
      .filter(v => v.lastMinute || !lastMinute)
      .forEach(sr => applySetReorder(sr, elementsCopy, elements));

    return [elementsCopy, setReorders]
  }

  if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("AnkiSetRandomizerOptions")) {
    const options = Persistence.getItem("AnkiSetRandomizerOptions");

    const form = formatter(options);
    const originalStructure = form.getOriginalStructure();

    if (originalStructure) {
      const numberedSets       = processNumberedSets(originalStructure);
      const elementSharingSets = processElementSharingSets(originalStructure);
      const orderSharingSets   = processElementSharingSets(originalStructure);

      const [newElements, newReorders] = generateRandomization(
        numberedSets,
        elementSharingSets,
        orderSharingSets,
        false,
      );

      //////////////////////////////////////////////////////////////////////////////
      // are applied last to first
      const commands = processCommands(originalStructure);

      const reversedCommands = commands.reverse();
      const sortedReversedCommands = [
        reversedCommands.filter(v => v[2] === 'm'),
        reversedCommands.filter(v => v[2] === 'c'),
        reversedCommands.filter(v => v[2] === 'd')
      ].flat();

      sortedReversedCommands
        .forEach(cmd => applyCommand(cmd, newElements));

      //////////////////////////////////////////////////////////////////////////////
      const lastMinuteStructure = newElements
        .map(set => set.filter(elem => elem[3] !== 'd'));

      const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure)
        .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}));

      const [lastMinuteElements, lastMinuteSetReorders] = generateRandomization(
        lastMinuteNumberedSets,
        elementSharingSets,
        orderSharingSets.filter(v => v.lastMinute),
        true,
      );

      //////////////////////////////////////////////////////////////////////////////
      form.renderSets(lastMinuteElements);
    }
  }

}());
