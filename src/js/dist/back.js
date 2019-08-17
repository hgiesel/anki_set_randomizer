(function () {
  'use strict';

  function escapeString(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * For all funtions that concerns accessing the html content
   */

  function formatter(options) {

    let _rawStructure = {};
    const exprString = `${escapeString(options.inputSyntax.openDelim)}(?:::)?(.*?)(?:::)?${escapeString(options.inputSyntax.closeDelim)}`;

    const getRawStructure = function(theQuery=options.query) {
      if (_rawStructure[theQuery]) {
        return _rawStructure[theQuery]
      }

      else {
        const theElement = document.querySelector(theQuery);
        const theBody = theElement ? theElement.innerHTML : '';

        const rawStructure = [];
        const exprRegex    = RegExp(exprString, 'gm');

        let m = exprRegex.exec(theBody);
        while (m) {
          rawStructure.push(m[1]);
          m = exprRegex.exec(theBody);
        }

        return _rawStructure[theQuery] = rawStructure
      }
    };

    const getOriginalStructure = function(theQuery=options.query) {
      const splitResults = [];

      for (const [i, group] of getRawStructure(theQuery).entries()) {
        const splitGroup = group
          .split(options.inputSyntax.fieldSeparator)
          .map((v, j) => [i, j, v]);

        splitResults.push(splitGroup);
      }

      return splitResults
    };

    const renderSets = function(reordering, randomIndices, theQuery=options.query) {

      console.log(reordering);

      let absoluteIndex = 0 + (
        options.colors_random_start_index
        ? Math.floor((randomIndices[0] || Math.random()) * options.colors.length)
        : 0
      );

      const stylizedResults = Array(reordering.length);
      for (const [i, set] of reordering.entries()) {

        const actualValues = [];

        const randomStartIndex = (
          options.colors_random_start_index
          ? Math.floor((randomIndices[i] || Math.random()) * options.colors.length)
          : 0
        );

        for (const [j, element] of set.rendering.entries()) {
          if (element[3] !== 'd') {
            const theIndex    = ((options.colors_collective_indexing ? absoluteIndex++ : randomStartIndex + j) % options.colors.length);

            const className   = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`;

            const colorChoice = options.colors[theIndex] ? ` color: ${options.colors[theIndex]};` : '';
            const style       = `style="padding: 0px ${options.fieldPadding}px;${colorChoice}"`;

            actualValues.push(`<span ${className} ${style}>${element[2]}</span>`);
          }
        }

        stylizedResults[set.order] = (actualValues.join(options.outputSyntax.fieldSeparator));
      }

      const theElement = document.querySelector(theQuery);
      let replacement = theElement ? theElement.innerHTML : '';

      for (const [i, v] of getRawStructure(theQuery).entries()) {

        const renderOutput = stylizedResults[i] || options.outputSyntax.emptySet;

        replacement = replacement
          .replace(
            `${options.inputSyntax.openDelim}${v}${options.inputSyntax.closeDelim}`,
            `${options.outputSyntax.openDelim}${renderOutput}${options.outputSyntax.closeDelim}`
          );
      }

      document.querySelector(theQuery).innerHTML = replacement;

      if (theQuery === 'div#clozed') {

        const olParse = getOriginalStructure('div#original').flat();

        if (olParse.length > 0) {
          const newReordering = reordering
            .map(v => ({ rendering: v.rendering
              .map(w => [
                w[0],
                w[1],
                olParse.find(u => u[0] === w[0] && u[1] === w[1])[2],
                w[3]],
              ), order: v.order
            }));

          renderSets(newReordering, randomIndices, 'div#original');
        }
      }
    };

    return {
      getOriginalStructure: getOriginalStructure,
      renderSets: renderSets,
    }
  }

  function generateRandomValue(min, max) {
    return Math.random() * (max - min) + min
  }

  // also processes generator patterns
  function processNumberedSets(originalStructure, preGeneratedValues) {
    const result          = [];
    const generatorValues = [];

    // get generatorSets
    const generatorSetPattern = new RegExp('^\\^([a-zA-Z_]\\w*)\\[(.*)\\]$');
    const generatorSets       = [];

    for (const [i, set] of originalStructure.entries()) {
      for (const elem of set) {

        let match;
        if (match = elem[2].match(generatorSetPattern)) {
          generatorSets.push({
            name: match[1],
            elements: match[2].substr(1, match[2].length - 2).split(new RegExp(`['"],["']`)), // match[2].split(new RegExp('(?<="),(?=")')),
          });
        }

      }
    }

    const lastMinutePattern = new RegExp('^\\^!!?$');

    const generatorSymbol            = '#';
    const uniquenessConstraintSymbol = '\\$';

    const intPattern       = '\\d+';
    const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`;

    const realIntGenerator           = `${realOrIntPattern},${realOrIntPattern}(?:,${intPattern})?`;
    const realIntGeneratorWithGroups = `(${realOrIntPattern}),(${realOrIntPattern})(?:,(${intPattern}))?`;

    const setGenerator     = '[a-zA-Z_]\\w*';

    const generatorPattern = `^\\^(?:[a-zA-Z_]\\w*${uniquenessConstraintSymbol})?(${realIntGenerator}|${setGenerator})${generatorSymbol}$`;
    const uniquenessSetRegex = `^\\^([a-zA-Z_]\\w*)${uniquenessConstraintSymbol}`;

    const contentElementPattern = new RegExp('^[^\\^]');

    const uniquenessSets = [];

    for (const [i, set] of originalStructure.entries()) {

      const contentElements = [];
      let lastMinute = false;

      for (const elem of set) {

        let patternResult;

        if (lastMinutePattern.test(elem[2])) {
          lastMinute = true;
        }
        else if (patternResult = new RegExp(generatorPattern, 'gm').exec(elem[2])) {

          const uniquenessConstraintMatch = patternResult[0].match(RegExp(uniquenessSetRegex));

          let uniquenessConstraintName;
          if (uniquenessConstraintMatch) {
            uniquenessConstraintName = uniquenessConstraintMatch[1];
          }

          if (!uniquenessSets.find(v => v.name === uniquenessConstraintName)) {
            uniquenessSets.push({
              name: uniquenessConstraintName,
              values: []
            });
          }

          const setIndex  = elem[0];
          const elemIndex = elem[1];

          let resultValue2;

          const maybePregeneratedValue = preGeneratedValues
            .find(v => v[0] === setIndex && v[1] === elemIndex);

          if (maybePregeneratedValue) {
            resultValue2 = maybePregeneratedValue;
          }

          else {

            if (/^\d/.test(patternResult[1])) {
              // generate a random integer or real number
              const intOrValueGenerator = patternResult[1].match(RegExp(realIntGeneratorWithGroups));

              const minValue   = intOrValueGenerator[1];
              const maxValue   = intOrValueGenerator[2];
              const extraValue = intOrValueGenerator[3];

              const isReal      = minValue.includes('.') || maxValue.includes('.');

              let uniqueValueFound = false;
              let resultValue;

              let countIdx = 0;
              const countIdxMax = 1000;

              while (!uniqueValueFound && countIdx < countIdxMax) {

                const preValue = generateRandomValue(
                  Number(minValue),
                  Number(maxValue),
                );

                resultValue = isReal
                  ? preValue.toFixed(extraValue || 2)
                  : (Math.round(preValue) * (extraValue || 1)).toString();

                if (uniquenessConstraintName) {
                  if (!uniquenessSets
                    .find(v => v.name === uniquenessConstraintName)
                    .values.includes(resultValue)
                  ) {
                    uniqueValueFound = true;
                  }
                }

                countIdx++;
              }

              if (countIdx < countIdxMax) {
                resultValue2 = [setIndex, elemIndex, resultValue];
              }
            }

            else {
              // generate string from generator set
              const text = patternResult[1];
              const foundGeneratorSet = generatorSets.find(v => v.name === text);

              if (foundGeneratorSet) {

                let resultValue;

                let uniqueValueFound = false;
                let countIdx = 0;
                const countIdxMax = 1000;

                while (!uniqueValueFound && countIdx < countIdxMax) {
                  const idx         = Math.floor(Math.random() * foundGeneratorSet.elements.length);
                  resultValue = foundGeneratorSet.elements[idx];

                  if (uniquenessConstraintName) {
                    if (!uniquenessSets
                      .find(v => v.name === uniquenessConstraintName)
                      .values.includes(resultValue)
                    ) {
                      uniqueValueFound = true;
                    }
                  }

                  countIdx++;
                }

                if (countIdx < countIdxMax) {
                  resultValue2 = [setIndex, elemIndex, resultValue];
                }
              }
            }
          }
          // else -> no element can be generated
          // get resultValue2

          if (resultValue2) {
            if (uniquenessConstraintName) {
              uniquenessSets
                .find(v => v.name === uniquenessConstraintName)
                .values.push(resultValue2[2]);
            }

            generatorValues.push(resultValue2);
            contentElements.push(resultValue2);
          }
        }

        else if (contentElementPattern.test(elem[2])) {
          contentElements.push(elem);
        }
      }

      result.push({
        name: i,
        elements: contentElements,
        lastMinute: lastMinute,
      });
    }

    return [result, generatorValues]
  }

  function processElementSharingSets(originalStructure) {
    const elementSharingSets = [];

    const maybeSharedOrderPattern = '(?:[a-zA-Z_]\\w*\\?\\??)?';
    const namedSetPattern   = `^\\^([a-zA-Z_]\\w*)!!?${maybeSharedOrderPattern}$`;
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

  function processOrderSharingSets(originalStructure) {
    const orderSharingSets = [];

    const maybeNamedSetPattern = '(?:([a-zA-Z_]\\w*)!!?)?';
    const sharedOrderPattern   = `^\\^${maybeNamedSetPattern}([a-zA-Z_]\\w*)\\?$`;
    const lastMinutePattern    = new RegExp('^\\^.*\\?\\?$');

    for (const elem of originalStructure.flat()) {

      let patternResult;
      if (patternResult = new RegExp(sharedOrderPattern).exec(elem[2])) {

        const correspondingSet = patternResult[1] || elem[0];

        if (orderSharingSets.filter(v => v.name === patternResult[2]).length === 0) {
          orderSharingSets.push({
            name: patternResult[2],
            sets: [correspondingSet],
            // dictator: false, // I think this should be calculated at a later stage
          });
        }

        else {
          orderSharingSets.filter(v => v.name === patternResult[2])[0].sets.push(correspondingSet);
        }

        if (lastMinutePattern.test(elem[2])) {
          orderSharingSets.filter(v => v.name === patternResult[1])[0].lastMinute = true;
        }
      }
    }

    return orderSharingSets
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

    const idxPattern      = '(\\d+|\\+\\d+|\\-\\d+|n(?:-\\d+)?|[a-zA-Z_]\\w*)';
    const positionSymbol  = ':';
    const positionPattern = `(?:${positionSymbol}(\\d+|n(?:-\\d+)?))?`;

    const amountPattern   = '(?:,(\\d+))?';

    const copySymbol    = '=';
    const moveSymbol    = '\\~';
    const deleteSymbol  = '\\%';

    // (^^=^), 0 args: current set, 999 elements
    // (^^n=^), 1 args: set n, 999 elements
    // (^^n,m=^), 2 args: set n, m elements
    const copyPattern   = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${copySymbol}$`;
    const movePattern   = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${moveSymbol}$`;
    const deletePattern = `^\\^(?:${idxPattern}${positionPattern}${amountPattern})?${deleteSymbol}$`;

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
          const fromSetName     = processIndex(patternResult[1] || toSetName, toSetName, originalStructure.length);
          const fromSetPosition = processIndex(patternResult[2] || 0, toSetPosition, set.length);
          const fromSetAmount   = Number(patternResult[3]) || 999;

          result.push([
            fromSetName,
            fromSetPosition,
            fromSetAmount,
            commandType,
            toSetName,
            toSetPosition,
          ]);
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
      length: setReorders.find(w => w.name === v).length
    })).reduce((accu, v) => accu.length < v.length ? v : accu).name
  }

  function applySharedOrder(orderSharingSet, setReorders) {

    const dictator      = detectOrderDictator(orderSharingSet, setReorders);
    const dictatorOrder = setReorders.find(v => v.name === dictator).order;

    for (const set of orderSharingSet.sets) {

      const oldOrder = setReorders.find(v => v.name === set).order;
      const newOrder = dictatorOrder.filter(v => v < oldOrder.length);

      // modifies setReorders
      setReorders.forEach(v => {
        if (v.name === set) {
          v.order = newOrder;
        }
      });
    }

    return setReorders
  }

  function initializeNumberedSets(numberedSets) {
    return numberedSets
      .map(v => v.elements)
      .map(u => u.map(w => [w[0], w[1], w[2], 'n']))
  }
  function generateRandomization(
    numberedSets,
    elementSharingSets,
    orderSharingSets,
  ) {

    const elements     = initializeNumberedSets(numberedSets);
    const elementsCopy = JSON.parse(JSON.stringify(elements));

    const setReorders  = [
      reorderNumberedSets(numberedSets),
      reorderElementSharingSets(elementSharingSets, numberedSets),
    ].flat();

    // modifies setReorders (!)
    orderSharingSets.forEach(oss => applySharedOrder(oss, setReorders));
    return [elements, elementsCopy, setReorders]
  }

  function compareArrays(array, otherArray) {
    if (!otherArray || array.length !== otherArray.length) {
      return false
    }

    for (let i = 0, l=array.length; i < l; i++) {
      // Check if we have nested arrays
      if (array[i] instanceof Array && otherArray[i] instanceof Array) {
        // recurse into the nested arrays
        if (!compareArrays(array[i], otherArray[i])) {
          return false
        }
      }
      else if (array[i] != otherArray[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false
      }
    }
    return true
  }

  function matchStructures(originalStructure, inheritedOriginalStructure) {
    const result = [];

    for (const set of originalStructure) {
      for (const inheritedSet of inheritedOriginalStructure) {

        if (compareArrays(set.map(v => v[2]), inheritedSet.map(v => v[2]))
          // Don't make n-to-m mappings, only 1-to-1:
          && !result.find(v => v.from === inheritedSet[0][0])
          && !result.find(v => v.to === set[0][0])) {

          result.push({
            from: inheritedSet[0][0],
            to: set[0][0],
          });
        }
      }
    }

    return result
  }

  function matchGeneratorValues(structureMatches, generatorValues) {
    const result = [];

    for (const value of generatorValues) {
      const match = structureMatches.find(v => v.from === value[0]);

      if (match) {
        result.push([match.to, value[1], value[2]]);
      }
    }

    return result
  }

  function matchRandomIndices(structureMatches, randomIndices) {
    const result = [];

    let match;
    for (const [i, idx] of randomIndices.entries()) {

      if (match = structureMatches.find(v => v.from === i)) {
        result[match.to] = idx;
      }
    }

    return result
  }

  function complementArrays(elems1, elems2) {
    const result = [];

    for (const e of elems1) {
      result.push(e);
    }

    for (const e of elems2) {
      if (!result.includes(e)) {
        result.push(e);
      }
    }

    return result
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

  // values states include 'n', 'c', 'd'
  // cmds states include 'c', 'd', 'm'
  // cmd = [0:fromSet, 1:fromPosition, 2:fromAmount, 3:cmdName, 4:toSet, 5:toPosition]
  function applyCommand(cmd, elems) {

    // delete commands in original position
    // from position is IGNORED (!) atm
    const capturedElements = [];

    for (const elem of elems[cmd[0]]) {

      if (elem[3] !== 'd' && elem[3] !== 'c') {
        capturedElements.push(elem.map(v => v));

        if (cmd[3] === 'd' || cmd[3] === 'm') {
          elem[3] = 'd';
        }

        if (--cmd[2] === 0) {
          break
        }
      }
    }

    // .splice(pos, amount, replacement) -> deleted_values
    // .splice(n, 0) : does nothing
    // .splice(bigger_than_arr, m) : does nothing
    capturedElements.forEach(v => v.splice(3, 1, 'c'));

    // insert commands to new position
    if (cmd[3] === 'c' || cmd[3] === 'm') {
        elems[cmd[4]].splice(
          cmd[5],
          0,
          ...capturedElements,
        );
    }
  }

  function applyInheritedSetReorder(newReorders, inheritedNewReorders, structureMatches) {
    const modifiedReorders = [];

    for (const reorder of newReorders) {
      let match;

      if ((typeof reorder.name) === 'string') {
        if (match = inheritedNewReorders.find(v => reorder.name === v.name)) {

          modifiedReorders.push({
            name: reorder.name,
            length: reorder.length,
            sets: reorder.sets,
            setLengths: reorder.setLengths,
            order: complementArrays(match.order, reorder.order),
            lastMinute: reorder.lastMinute,
          });

        }
        else {
          modifiedReorders.push(reorder);
        }
      }

      else if (match = structureMatches.find(v => reorder.name === v.to)) {
        modifiedReorders.push(inheritedNewReorders.find(v => v.name === match.from));
      }
      else {
        modifiedReorders.push(reorder);
      }
    }

    return modifiedReorders
  }

  if (window.Persistence && Persistence.isAvailable()) {
    mainBack();
  }

  function mainBack() {
    const inheritedOriginalStructure  = Persistence.getItem("AnkiSetRandomizerOriginalStructure");
    const inheritedOptions            = Persistence.getItem("AnkiSetRandomizerOptions");
    const inheritedGeneratorValues    = Persistence.getItem("AnkiSetRandomizerGeneratorValues");
    const inheritedNewReorders        = Persistence.getItem("AnkiSetRandomizerNewReorders");
    const inheritedLastMinuteReorders = Persistence.getItem("AnkiSetRandomizerLastMinuteReorders");
    const inheritedRandomIndices      = Persistence.getItem("AnkiSetRandomizerRandomIndices");

    // invalid FrontSide will cause an invalid BackSide
    if (
      !inheritedOriginalStructure ||
      !inheritedOptions ||
      !inheritedGeneratorValues ||
      !inheritedNewReorders ||
      !inheritedLastMinuteReorders ||
      !inheritedRandomIndices
    ) {
      return
    }

    const form = formatter(inheritedOptions);
    const originalStructure = form.getOriginalStructure();

    if (originalStructure) {

      const structureMatches = matchStructures(originalStructure, inheritedOriginalStructure);

      const [numberedSets, _]  = processNumberedSets(originalStructure, matchGeneratorValues(structureMatches, inheritedGeneratorValues));
      const elementSharingSets = processElementSharingSets(originalStructure);
      const orderSharingSets   = processOrderSharingSets(originalStructure);

      const [newElements, newElementsCopy, newReorders] = generateRandomization(
        numberedSets,
        elementSharingSets,
        orderSharingSets,
      );

      const modifiedReorders = applyInheritedSetReorder(
        newReorders,
        inheritedNewReorders,
        structureMatches,
      );

      // modifies modifiesReorders (!)
      orderSharingSets.forEach(oss => applySharedOrder(oss, modifiedReorders));

      // numbered are sorted 0 -> n, then named are in order of appearance
      // modifies newElementsCopy (!)
      modifiedReorders
        .forEach(sr => applySetReorder(sr, newElements, newElementsCopy));

      //////////////////////////////////////////////////////////////////////////////
      // COMMANDS
      // are applied last to first
      const commands = processCommands(originalStructure);

      const reversedCommands = commands.reverse();
      const sortedReversedCommands = [
        reversedCommands.filter(v => v[3] === 'c'),
        reversedCommands.filter(v => v[3] === 'm'),
        reversedCommands.filter(v => v[3] === 'd'),
      ].flat();

      // modifies newElements
      sortedReversedCommands
        .forEach(cmd => applyCommand(cmd, newElements));

      //////////////////////////////////////////////////////////////////////////////
      const lastMinuteStructure = newElements
        .map(set => set.filter(elem => elem[3] !== 'd'));

      const lastMinuteNumberedSets = processNumberedSets(lastMinuteStructure, [])[0]
        .map((v, i) => ({name: v.name, elements: v.elements, lastMinute: numberedSets[i].lastMinute}));

      const lastMinuteOrderSharingSets = orderSharingSets.filter(v => v.lastMinute);

      const [lastMinuteElements, lastMinuteElementsCopy, lastMinuteReorders] = generateRandomization(
        lastMinuteNumberedSets,
        elementSharingSets,
        lastMinuteOrderSharingSets);

      const modifiedLastMinuteReorders = applyInheritedSetReorder(
        lastMinuteReorders,
        inheritedLastMinuteReorders,
        structureMatches,
      );

      // modifies modifiesReorders (!)
      lastMinuteOrderSharingSets.forEach(oss => applySharedOrder(oss, modifiedLastMinuteReorders));

      // numbered are sorted 0 -> n, then named are in order of appearance
      // modifies elementsCopy (!)
      modifiedLastMinuteReorders
        .filter(v => v.lastMinute)
        .forEach(sr => applySetReorder(sr, lastMinuteElements, lastMinuteElementsCopy));

      //////////////////////////////////////////////////////////////////////////////
      form.renderSets(
        lastMinuteElements
        // import for collective color indexing
        .map((v, i) => ({rendering: v, order: i})), matchRandomIndices(
          structureMatches,
          matchRandomIndices(structureMatches, inheritedRandomIndices)
        )
      );
    }
  }

}());
