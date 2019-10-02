(function () {
  'use strict';

  const dataName = 'SRData';

  function saveData(theSaveData) {
    Persistence.removeItem(dataName);
    Persistence.setItem(dataName, theSaveData);
  }

  function escapeString(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function treatNewlines(text) {
    return text
      .replace(RegExp('</div><div>', 'g'), '<br>')
      .replace(RegExp('<div>', 'g'), '<br>')
  }

  /**
   * For all funtions that concerns accessing the html content
   */

  function formatter(inputSyntax) {

    // the original NodeList
    const _htmlContent  = {};
    const getHtml = function(theSelector=inputSyntax.cssSelector) {
      if (_htmlContent[theSelector]) {
        return _htmlContent[theSelector]
      }
      else {
        const theHtml = document.querySelectorAll(theSelector);

        return _htmlContent[theSelector] = theHtml
      }
    };

    let isValid     = true;

    const elemDelim = '$$$$$D$E$L$I$M$$$$$';

    // a single big string with inserted elemDelims
    const _rawStructure = {};
    const getRawStructure = function(theSelector=inputSyntax.cssSelector) {
      if (_rawStructure[theSelector]) {
        return _rawStructure[theSelector]
      }

      else {
        const theHtml = getHtml(theSelector);

        if (!theHtml || theHtml.length === 0) {
          isValid = false;
          return _rawStructure[theSelector] = ''
        }

        const theRawStructure = [...theHtml]
          .map(v => v.innerHTML)
          .join(elemDelim);

        return _rawStructure[theSelector] = theRawStructure
      }
    };

    const exprString =
      (inputSyntax.isRegex
        ? inputSyntax.openDelim
        : escapeString(inputSyntax.openDelim)) +
      `((?:.|\\n|\\r)*?)` +
      (inputSyntax.isRegex
        ? inputSyntax.closeDelim
        : escapeString(inputSyntax.closeDelim));

    // the found sets in the text
    const _foundStructure = {};
    const getFoundStructure = function(theSelector=inputSyntax.cssSelector) {
      if (_foundStructure[theSelector]) {
        return _foundStructure[theSelector]
      }

      else {
        const theFoundStructure = [];

        const theRawStructure = getRawStructure(theSelector);

        let exprRegex;

        try {
          exprRegex = RegExp(exprString, 'gm');
        }
        catch {
          isValid = false;
          return _foundStructure[theSelector] = []
        }

        let m = exprRegex.exec(theRawStructure);

        while (m) {
          theFoundStructure.push(m[1]);
          m = exprRegex.exec(theRawStructure);
        }

        return _foundStructure[theSelector] = theFoundStructure
      }
    };

    // 2d list of elements in the form of [[i, j, element]]
    const _originalStructure = {};
    const getOriginalStructure = function(theSelector=inputSyntax.cssSelector) {
      if (_originalStructure[theSelector]) {
        return _originalStructure[theSelector]
      }

      else {
        const theOriginalStructure = [];
        const theFoundStructure = getFoundStructure(theSelector);

        for (const [i, group] of theFoundStructure.entries()) {
          const splitGroup = group
            .split(inputSyntax.isRegex
              ? new RegExp(inputSyntax.fieldSeparator)
              : inputSyntax.fieldSeparator)
            .map((elem, j) => [i, j, elem, /* TODO 'n' */]);

          theOriginalStructure.push(splitGroup);
        }

        return _originalStructure[theSelector] = theOriginalStructure
      }
    };

    const stylingsAccessor = function(stylingDefinitions, randomIndices) {

      const defaultStyle = stylingDefinitions.find(v => v.name === 'default').stylings;

      stylingDefinitions
        .forEach(def => {
          def.stylings.randomIndices = randomIndices[def.name] || [];
          def.stylings.nextIndex = 0;
        });

      const propAccessor = function(styleName, theDefaultStyle=defaultStyle) {

        const theStyle = styleName
          ? stylingDefinitions.find(v => v.name === styleName).stylings
          : theDefaultStyle;

        const getProp = function(propName, propName2) {

          return propName2 === undefined
            ? theStyle[propName] !== undefined
              ? theStyle[propName]
              : theDefaultStyle[propName]
            : theStyle[propName] === undefined || theStyle[propName][propName2] === undefined
              ? theDefaultStyle[propName][propName2]
              : theStyle[propName][propName2]
        };

        let currentIndex;

        const getColorIndex = function() {

          let theIndex;
          if (currentIndex === undefined) {
            if (getProp('colors', 'collectiveIndexing') && getProp('colors', 'randomStartIndex')) {

              if (getProp('colors', 'randomIndices').length === 0) {
                theIndex = Math.floor(Math.random() * getProp('colors', 'values').length);
                getProp('randomIndices').push(theIndex);
              }
              else {
                theIndex = getProp('nextIndex') === 0
                  ? getProp('randomIndices')[0]
                  : getProp('nextIndex') % getProp('colors', 'values').length;
              }

            }
            else if (getProp('colors', 'collectiveIndexing')) {
              theIndex = (getProp('nextIndex')) % getProp('colors', 'values').length;
            }
            else if (getProp('colors', 'randomStartIndex')) {
              theIndex = Math.floor(Math.random() * getProp('colors', 'values').length);
              getProp('randomIndices').push(theIndex);
            }
            else {
              theIndex = 0;
            }
          }

          else {
            theIndex = ++currentIndex % getProp('colors', 'values').length;
          }

          currentIndex = theIndex;
          theStyle.nextIndex = currentIndex + 1;

          return theIndex
        };

        return {
          getProp: getProp,
          getColorIndex: getColorIndex,
        }

      };

      const exportIndices = function() {
        const result = {};

        stylingDefinitions
          .forEach(def => {
            result[def.name] = def.stylings.randomIndices;
          });

        return result
      };

      return {
        defaultStyle: defaultStyle,
        propAccessor: propAccessor,
        exportIndices: exportIndices,
      }
    };

    const renderSets = function(reordering, stylingDefinitions, stylingAssignments, randomIndices, numberedSets, theSelector=inputSyntax.cssSelector) {

      const sa = stylingsAccessor(stylingDefinitions, randomIndices);
      const stylizedResults = Array(reordering.length);

      for (const [i, set] of reordering.entries()) {

        const actualValues = [];
        const styleName = stylingAssignments[i];
        const pa = sa.propAccessor(styleName);

        if (pa.getProp('display') === 'sort') {
          set.rendering.sort();
        }
        else if (pa.getProp('display') === 'orig') {
          set.rendering = numberedSets.find(v => v.name === i).elements;
        }

        for (const [j, element] of set.rendering.entries()) {
          if (element[3] !== 'd') {
            const theIndex = pa.getColorIndex();

            const colorChoice = pa.getProp('colors', 'values')
              ? ` color: ${pa.getProp('colors', 'values')[theIndex]};`
              : '';

            const className = `class="set-randomizer--element set-randomizer--element-index-${element[0]}-${element[1]}"`;
            const blockDisplay = pa.getProp('display') === 'block'
              ? ' display: block;'
              : '';

            const style = `style="padding: 0px ${pa.getProp('fieldPadding')}px;${colorChoice}${blockDisplay}"`;
            const theValue = pa.getProp('display') === 'block'
              ? `<record ${className} ${style}><div>${treatNewlines(element[2])}</div></record>`
              : `<record ${className} ${style}>${element[2]}</record>`;

            actualValues.push(theValue);
          }
        }

        if (pa.getProp('display') === 'none') {
          stylizedResults[set.order] = '';
        }
        else if (actualValues.length === 0 || pa.getProp('display') === 'empty') {
          stylizedResults[set.order] =
            `${pa.getProp('openDelim')}` +
            `${pa.getProp('emptySet')}` +
            `${pa.getProp('closeDelim')}`;
        }
        else {
          stylizedResults[set.order] =
            `${pa.getProp('openDelim')}` +
            `${actualValues.join(pa.getProp('fieldSeparator'))}` +
            `${pa.getProp('closeDelim')}`;
        }
      }

      let theRawStructure = getRawStructure(theSelector);

      for (const [i, value] of getFoundStructure(theSelector).entries()) {
        theRawStructure = theRawStructure
          .replace(
            (inputSyntax.isRegex
              ? new RegExp(`${inputSyntax.openDelim}${escapeString(value)}${inputSyntax.closeDelim}`)
              : `${inputSyntax.openDelim}${value}${inputSyntax.closeDelim}`),
            `${stylizedResults[i]}`
          );
      }

      const theHtml = getHtml(theSelector);

      theRawStructure
        .split(elemDelim)
        .forEach((v, i) => theHtml[i].innerHTML = v);

      if (theSelector === 'div#clozed') {
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

          renderSets(newReordering, renderDirectives, randomIndices, 'div#original');
        }
      }

      return sa.exportIndices()
    };

    return {
      getOriginalStructure: getOriginalStructure,
      renderSets: renderSets,
      isValid: isValid,
    }
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

  function detectOrderDictator(sog, setReorders) {
    return sog.sets.map(v => ({
      name: v,
      length: setReorders.find(w => w.name === v).length
    })).reduce((accu, v) => accu.length < v.length ? v : accu).name
  }

  function reorderNumberedSets(numberedSets) {
    return numberedSets.map(v => ({
      name: v.name,
      length: v.elements.length,
      sets: [v.name],
      setLengths: [v.elements.length],
      order: shuffle([...new Array(v.elements.length).keys()]),
      lastMinute: v.lastMinute,
    }))
  }

  function reorderSharedElementsGroups(sharedElementsGroups, numberedSets) {
    return sharedElementsGroups.map(v => {

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

  function applySharedOrder(sog, setReorders) {

    const dictator = detectOrderDictator(sog, setReorders);
    sog.dictator = dictator;

    const dictatorOrder = setReorders.find(v => v.name === sog.dictator).order;

    for (const set of sog.sets) {

      const oldOrder = setReorders.find(v => v.name === set).order;
      const newOrder = dictatorOrder.filter(v => v < oldOrder.length);

      // modifies setReorders
      setReorders.forEach(v => {
        if (v.name === set) {
          v.order = newOrder;
          if (sog.lastMinute) {
            v.lastMinute = true;
          }
        }
      });
    }

    return setReorders
  }

  // TODO I think I can delete this
  function initializeNumberedSets(numberedSets) {
    return numberedSets
      .map(v => v.elements)
      .map(u => u.map(w => [w[0], w[1], w[2], 'n']))
  }

  function generateRandomization(
    numberedSets,
    sharedElementsGroups,
  ) {

    const elements     = initializeNumberedSets(numberedSets);
    const elementsCopy = JSON.parse(JSON.stringify(elements));

    const setReorders  = [
      reorderNumberedSets(numberedSets),
      reorderSharedElementsGroups(sharedElementsGroups, numberedSets),
    ].flat();

    return [elements, setReorders]
  }

  function shareOrder(
    setReorders,
    sharedOrderGroups,
  ) {
    // modifies setReorders (!)
    sharedOrderGroups
      .forEach(sog => applySharedOrder(sog, setReorders));
  }

  // modifies in-place (!)
  function rotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
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

  function applySetReorder(srs, elems) {
    // sort by size of sets to be reordered
    const sortedSrs = srs.slice(0).sort(
      (a, b) => {
        if (a.sets.length > b.sets.length) {
          return -1
        }
        else if (a.sets.length < b.sets.length) {
          return 1
        }
        else {
          if (typeof a.name === 'string') {
            return -1
          }
          else {
            return 1
          }
        }
      });

    const appliedSrs = [];

    for (const sr of sortedSrs) {

      const alreadySorted = appliedSrs
        .reduce(
          (accu, v) => accu || sr.sets.every(srv => v.includes(srv)),
          false
        );

      if (!alreadySorted) {
        const flatSaveElems = sr
          .sets
          .map(v => elems[v])
          .flat();

        sliceWithLengths(
          sortWithIndices(flatSaveElems, sr.order),
          sr.setLengths
        )
          .forEach((v, i) => {
            elems[sr.sets[i]] = v;
          });

        appliedSrs.push(sr.sets);
      }
    }
  }

  function applyInheritedSetReorder(newReorders, inheritedNewReorders, structureMatches) {
    const modifiedReorders = [];

    for (const reorder of newReorders) {
      let match;

      // numbered sets
      if (match = structureMatches.find(v => reorder.name === v.to)) {
        modifiedReorders.push(inheritedNewReorders.find(v => v.name === match.from));
      }

      // named sets
      else if (match = inheritedNewReorders.find(v => reorder.name === v.name)) {

        modifiedReorders.push({
          name: reorder.name,
          length: reorder.length,
          sets: reorder.sets,
          setLengths: reorder.setLengths,
          order: complementArrays(match.order, reorder.order),
          lastMinute: reorder.lastMinute,
        });
      }

      // new sets
      else {
        modifiedReorders.push(reorder);
      }
    }

    return modifiedReorders
  }

  // values states include 'n', 'c', 'd'
  // cmds states include 'c', 'd', 'm'
  // cmd = [0:cmdType, 1: amount, 2:fromPosition, 3:fromAmount, 4:toSet, 5:toPosition]
  function applyCommands(cmds, elems) {
    const cmdType = 0;

    cmds
      .sort((a, b) => {
        if (a[cmdType] === b[cmdType]) { return 0 }
        if (a[cmdType] === 'c') { return -1 }
        if (a[cmdType] === 'm' && b[cmdType] === 'd') { return -1 }
        if (a[cmdType] === 'm' && b[cmdType] === 'c') { return 1 }
        if (a[cmdType] === 'd') { return 1 }
      })
      .forEach(cmd => applyCommand(cmd, elems)); // modifies newElements
  }

  function applyCommand(cmd, elems) {

    const cmdName             = cmd[0];
    const fromSet             = cmd[2];
    const fromPosition        = cmd[3];
    const toSet               = cmd[4];
    const contentElementCount = cmd[5];

    let theElems;

    switch (typeof fromSet) {
      case 'number':
        theElems = elems[fromSet];
        break

      // it's a list
      case 'object':
        theElems   = fromSet.flatMap(i => elems[i]);
        break
    }


    // don't allow crazy positions indices
    if (
      theElems.length <= fromPosition ||
      fromPosition < -theElems.length
    ) {
      return
    }

    rotate(theElems, fromPosition);

    const capturedElements = [];

    let elemAmount = cmd[1];

    for (const elem of theElems) {
      const elemType = elem[3];

      if (elemType !== 'd' && elemType !== 'c') {

        capturedElements.push(elem.slice(0));

        if (cmdName === 'd' || cmdName === 'm') {
          // modifies elems
          elem[3] = 'd';
        }

        if (--elemAmount === 0) {
          break
        }
      }
    }

    // .splice(pos, amount, replacement) -> deleted_values
    // .splice(n, 0) : does nothing
    // .splice(bigger_than_arr, m) : does nothing
    capturedElements
      .forEach(v => v.splice(3, 1, 'c'));

    // insert commands to new position
    if ((cmdName === 'c' || cmdName === 'm') && capturedElements.length > 0) {

      let elemCount   = contentElementCount;
      let thePosition = 0;

      while (elemCount > 0) {
        thePosition += elems[toSet]
          .slice(thePosition)
          .findIndex(v => v[3] === 'n' || v[3] === 'd');
        thePosition++;
        elemCount--;
      }

      // modifies elems
      elems[toSet].splice(
        thePosition,
        0,
        ...capturedElements,
      );
    }

    // rotate back
    rotate(theElems, -fromPosition);
  }

  const namePattern = '[a-zA-Z_]\\w*';

  function getCorrespondingSets(
    originalStructure,
    namedSets,
    absolutePos,
    absolutePosFromEnd,
    currentPos,
    relativePos,
    otherNamedSet,
    otherNamedSetPos,
  ) {
    let correspondingSets;

    if (absolutePos) {
      correspondingSets = [Number(absolutePos)];
    }
    else if (absolutePosFromEnd) {
      const offset = Number(absolutePosFromEnd.slice(1));
      correspondingSets = [originalStructure.length + offset - 1];
    }
    else if (relativePos) {
      const idx = currentPos + Number(relativePos);

      correspondingSets = originalStructure[idx]
        ? [idx]
        : [];
    }
    else if (otherNamedSet) {
      const foundSets = namedSets
        .find(v => v.name === otherNamedSet);

      const finalSets = foundSets
        ? foundSets.sets
        : [];

      if (foundSets && otherNamedSetPos) {
        const idx = Number(otherNamedSetPos) >= 0
          ? Number(otherNamedSetPos)
          : originalStructure.length + Number(otherNamedSetPos) - 1;

        correspondingSets = finalSets[idx] >= 0
          ? [finalSets[idx]]
          : [];

      }
      else {
        correspondingSets = finalSets;
      }
    }
    else /* self-referential */ {
      correspondingSets = [currentPos];
    }

    return correspondingSets
  }

  const star = {"star":true};

  function generateRandomValue(min, max, extra, isReal) {
    const preValue = Math.random() * (max - min) + min;

    return isReal
      ? preValue.toFixed(extra || 2)
      : (Math.round(preValue) * (extra || 1)).toString()
  }

  // also processes generator patterns
  function processNumberedSets(originalStructure, preGeneratedValues) {

    const [
      evaluators,
    ] = evalEvaluations(originalStructure);

    const [
      valueSets,
      valueSetResolutions,
      uniquenessConstraints,
    ] = evalValueSets(originalStructure, evaluators);

    const [
      result,
      generatedValues,
    ] = evalPicks(originalStructure, valueSets, valueSetResolutions, uniquenessConstraints, preGeneratedValues);

    return [result, generatedValues, valueSets]
  }

  const sharedRegexes = {
    positionPattern:  `:(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))`,
  };

  function evalEvaluations(originalStructure) {
    const evaluators = [];

    const evaluatorPattern = new RegExp(
      `^\\$(?:evaluate|eval|e)\\(` +
      `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
      `(?:(${namePattern})(?:(?:${sharedRegexes.positionPattern})?${sharedRegexes.positionPattern})?)` +
      `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
    );

    for (const elem of originalStructure.flat()) {
      let match;

      // evaluations
      if (match = elem[2].match(evaluatorPattern)) {

        const count = match[1];
        const valueSetName = match[2];

        const maybeNumberSetIndex = Number(match[3]);
        const maybeNumberValueIndex = Number(match[5]);

        const uniquenessConstraint = match[7];

        evaluators.push([
          valueSetName,
          !Number.isNaN(maybeNumberSetIndex) ? maybeNumberSetIndex : star,
          !Number.isNaN(maybeNumberValueIndex) ? maybeNumberValueIndex : star,
          count != undefined ? Number(count) : 1,
          uniquenessConstraint,
        ]);
      }
    }

    return [
      evaluators,
    ]
  }

  function evalValueSets(originalStructure, evaluators) {
    const valueSets = {};
    const valueSetResolutions = [];
    const uniquenessConstraints = [];

    const valueSetPattern = new RegExp(
      `^\\$(\\$)?(${namePattern})(?!\\()(\\W)((?:.|\\n|\\r)*)`
    );

    // modifies evaluators !!!!!
    evaluators.reverse();
    const newLinePattern = new RegExp(`\\\\n`, 'g');
    const catchPattern = new RegExp(`\\\\.`, 'g');

    for (const elem of originalStructure.flat()) {
      let match;

      // value set shortcut
      if (match = elem[2].match(valueSetPattern)) {
        const valueSetName     = match[2];
        const isSelfEvaluating = match[1] === '$' ? true : false;

        const values = match[4]
          .split(new RegExp(`(?<!\\\\)\\${match[3]}`, 'g'))
          .map(v => v
            .replace(new RegExp(`\\${match[3]}`, 'g'), match[3])
            .replace(newLinePattern, '<br/>')
            .replace(catchPattern, (x) => x.slice(1))
          );

        const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
          name: valueSetName,
          idx: valueSets[valueSetName] ? valueSets[valueSetName].length : 0,
          values: values,
          set: elem[0],
          pos: elem[1],
        }) - 1;

        const foundEvaluator = evaluators.find(v =>
          ((v[0] === valueSetName && v[1] === valueSetIndex) ||
            (v[0] === valueSetName && v[1] === star) ||
            (v[0] === star && v[1] === valueSetIndex) ||
            (v[0] === star && v[1] === star) && (v[2] === star || v[2] < values.length))
        );

        const resolvedValues = [];
        let wasStar;

        if (foundEvaluator) {
          wasStar = foundEvaluator[2] === star ? true : false;

          for (let i = 0; i < foundEvaluator[3]; i++) {

            let theValue = `%%${valueSetName}%%${valueSetIndex}%%${
            foundEvaluator[2] !== star ? foundEvaluator[2] : Math.floor(Math.random() * values.length)
          }%%`;

            const uniquenessConstraintName = foundEvaluator[4];

            if (uniquenessConstraintName) {

              if (!uniquenessConstraints.find(v => v.name === uniquenessConstraintName)) {
                uniquenessConstraints.push({
                  name: uniquenessConstraintName,
                  values: []
                });
              }

              let countIdx = 0;
              const countIdxMax = 1000;

              const uc = uniquenessConstraints
                .find(v => v.name === uniquenessConstraintName)
                .values;

              while (uc.includes(theValue) && countIdx < countIdxMax) {

                theValue = `%%${valueSetName}%%${valueSetIndex}%%${
                Math.floor(Math.random() * values.length)
              }%%`;

                if (foundEvaluator[2] !== star) {
                  countIdx = countIdxMax;
                }
                else {
                  countIdx++;
                }
              }

              if (countIdx === countIdxMax) {
                theValue = null;
              }
              else {
                uniquenessConstraints
                  .find(v => v.name === uniquenessConstraintName)
                  .values
                  .push(theValue);
              }
            }

            if (theValue !== null) {
              resolvedValues.push(theValue);
            }
          }
        }

        else if (isSelfEvaluating) {
          // even though technically it is star, the result is still predictable
          wasStar = false;

          resolvedValues.push(...Array.from(
            valueSets[valueSetName][valueSetIndex].values.keys(),
            idx => `%%${valueSetName}%%${valueSetIndex}%%${idx}`,
          ));
        }

        if (resolvedValues.length > 0) {
          valueSetResolutions.push([
            elem[0],
            elem[1],
            resolvedValues,
            wasStar,
          ]);
        }
      }
    }

    console.log(valueSetResolutions);

    return [
      valueSets,
      valueSetResolutions,
      uniquenessConstraints,
    ]
  }

  function evalPicks(originalStructure, valueSets, valueSetResolutions, uniquenessConstraints, preGeneratedValues) {

    const result = [];
    const generatedValues = [];

    const lastMinutePattern = new RegExp(`^\\$(n|name)!\\(\\)$`);

    const intPattern       = '\\d+';
    const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`;
    const realIntGenerator =
      `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`;

    const pickPattern = new RegExp(
      `^\\$(?:pick|p)\\(` +
      `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
      `(?:${realIntGenerator}|` +
      `(?:(${namePattern})(?:(?:${sharedRegexes.positionPattern})?${sharedRegexes.positionPattern})?)?)` +
      `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
    );

    const contentElementPattern = new RegExp('^[^\\$]');

    for (const [i, set] of originalStructure.entries()) {

      const contentElements = [];
      let lastMinute = false;

      for (const elem of set) {

        let match;
        const setIndex  = elem[0];
        const elemIndex = elem[1];

        if (lastMinutePattern.test(elem[2])) {
          lastMinute = true;
        }

        else if (match = valueSetResolutions.find(v => v[0] === setIndex && v[1] === elemIndex)) {

          let theElements;
          let maybePregeneratedValues;
          if (maybePregeneratedValues = preGeneratedValues
            .find(v =>
              v[0] === setIndex &&
              v[1] === elemIndex)) {
            theElements = maybePregeneratedValue[2];
          }
          else {
            theElements = match;
          }

          contentElements.push(...match[2].map(v => [match[0], match[1], v]));

          if (match[3]) {
            generatedValues.push(...theElements);
          }
        }

        else if (match = elem[2].match(pickPattern)) {

          const count =
            match[1] !== undefined
            ? Number(match[1]) : 1;

          const uniquenessConstraintName = match[9];

          const minValue   = match[2];
          const maxValue   = match[3];
          const extraValue = match[4];

          const valueSetName       = match[5];
          const maybeValueSetSetIndex   = Number(match[6]);
          const maybeValueSetValueIndex = Number(match[8]);

          const valueSetSetIndex = !Number.isNaN(maybeValueSetSetIndex)
          ? maybeValueSetSetIndex
          : match[7] ? star : 0;

          const valueSetValueIndex = !Number.isNaN(maybeValueSetValueIndex)
          ? maybeValueSetValueIndex
          : star;

          if (
            uniquenessConstraintName &&
            !uniquenessConstraints.find(v => v.name === uniquenessConstraintName)
          ) {
            uniquenessConstraints.push({
              name: uniquenessConstraintName,
              values: []
            });
          }

          const resultValues = [];

          let maybePregeneratedValue;
          if (maybePregeneratedValue = preGeneratedValues
            .find(v =>
              v[0] === setIndex &&
              v[1] === elemIndex)) {
            resultValues = maybePregeneratedValue[2];
          }

          else {

            for (let i = 0; i < count; i++) {
              let resultValue;

              if (minValue && maxValue /* number pick */) {
                // generate a random integer or real number
                const isReal = minValue.includes('.') || maxValue.includes('.');

                resultValue = generateRandomValue(
                  Number(minValue),
                  Number(maxValue),
                  Number(extraValue),
                  isReal,
                );

                if (uniquenessConstraintName) {
                  let countIdx = 0;
                  const countIdxMax = 1000;

                  while (uniquenessConstraints
                    .find(v => v.name === uniquenessConstraintName)
                    .values.includes(resultValue)
                    && countIdx < countIdxMax) {

                    resultValue = generateRandomValue(
                      Number(minValue),
                      Number(maxValue),
                      Number(extraValue),
                      isReal,
                    );

                    countIdx++;
                  }

                  if (countIdx == countIdxMax) {
                    resultValue = null;
                  }
                }
              }

              else /* value set pick */ {

                const foundValueSet = valueSets[
                  valueSetName === star
                  ? Object.keys(valueSets)[Math.floor(Math.random() * valueSets.length)]
                  : valueSetName
                ];

                const vidx = valueSetSetIndex === star
                  ? Math.floor(Math.random() * valueValueSet.length)
                  : valueSetSetIndex;

                const foundValueSubSet = foundValueSet && foundValueSet.length > 0
                  ? foundValueSet[vidx]
                  : null;

                if (foundValueSubSet) {
                  if (valueSetValueIndex === star) {
                    const randomIndex = Math.floor(Math.random() * foundValueSubSet.values.length);
                    resultValue = `%%${foundValueSubSet.name}%%${vidx}%%${randomIndex}%%`;
                  }
                  else {
                    resultValue = `%%${foundValueSubSet.name}%%${vidx}%%${valueSetValueIndex}%%`;
                  }
                }

                if (resultValue && uniquenessConstraintName) {
                  let countIdx = 0;
                  const countIdxMax = 1000;

                  while (uniquenessConstraints
                    .find(v => v.name === uniquenessConstraintName)
                    .values.includes(resultValue)
                    && countIdx < countIdxMax) {

                    const idx   = Math.floor(Math.random() * foundValueSubSet.values.length);
                    resultValue = foundValueSubSet.values[idx];

                    countIdx++;
                  }

                  if (countIdx == countIdxMax) {
                    resultValue = null;
                  }
                }
              }

              if (resultValue) {
                if (uniquenessConstraintName) {
                  uniquenessConstraints
                    .find(v => v.name === uniquenessConstraintName)
                    .values
                    .push(resultValue);
                }

                resultValues.push(resultValue);
              }
            }

            if (valueSetSetIndex === star || valueSetValueIndex === star) {
              generatedValues.push([setIndex, elemIndex, resultValues]);
            }

            contentElements.push(...resultValues.map(v => [setIndex, elemIndex, v]));
          }
        }

        else if (contentElementPattern.test(elem[2]) || elem[2].length === 0) {
          contentElements.push(elem);
        }
      }

      result.push({
        name: i,
        elements: contentElements,
        lastMinute: lastMinute,
      });
    }

    return [
      result,
      generatedValues,
    ]
  }

  function processSharedElementsGroups(originalStructure) {

    const namedSetPattern = new RegExp(
      `\\$(?:name|n)(!)?` +
      `\\(` +
      `(${namePattern})` +
      `(?:` +
      `\\s*,\\s*` +
      `(?:` + // second arg
      `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
      `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
      `)` +
      `)?` +
      `\\)$`
    );

    const sharedElementsGroups = [];

    originalStructure
      .flat()
      .map(v => [...v, v[2].match(namedSetPattern)])
      .filter(v => v[3])
      // sort self-referring sets to beginning
      .reduce((accu, v) => {
        v[3][3] || v[3][4] || v[3][5] || v[3][6] || v[3][7]
          ? accu.push(v)
          : accu.unshift(v);
        return accu
      }, [])
      .forEach(v => {
        const [
          _,
          isLastMinute,
          name,
          absolutePos,
          absolutePosFromEnd,
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        ] = v[3];

        const correspondingSets = getCorrespondingSets(
          originalStructure,
          sharedElementsGroups,
          absolutePos,
          absolutePosFromEnd,
          v[0],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        );

        let theSeg = sharedElementsGroups.find(v => v.name === name);

        if (!theSeg) {
          const idx = sharedElementsGroups.push({
            name: name,
            lastMinute: false,
            sets: []
          });

          theSeg = sharedElementsGroups[idx - 1];
        }

        theSeg.sets.push(...correspondingSets);
        theSeg.sets.sort();

        if (isLastMinute) {
          theSeg.lastMinute = true;
        }
      });

    return sharedElementsGroups
  }

  function processSharedOrderGroups(originalStructure, namedSets) {
    const sharedOrderGroups = [];

    const sharedOrderPattern = new RegExp(
      `\\$(?:order|ord|o)(!)?` +
      `\\(` +
      `(${namePattern})` +
      `(?:` +
      `\\s*,\\s*` +
      `(?:` + // second arg
      `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
      `(${namePattern})(?::(n-\\d+|-\\d|\\d+))?` + // named set arg
      `)` +
      `)?` +
      `\\)$`
    );

    originalStructure
      .flat()
      .map(v => [...v, v[2].match(sharedOrderPattern)])
      .filter(v => v[3])
      .forEach(v => {
        const [
          _,
          isLastMinute,
          name,
          absolutePos,
          absolutePosFromEnd,
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        ] = v[3];

        const correspondingSets = (otherNamedSet && !otherNamedSetPos)
          ? [otherNamedSet]
          : getCorrespondingSets(
            originalStructure,
            namedSets,
            absolutePos,
            absolutePosFromEnd,
            v[0],
            relativePos,
            otherNamedSet,
            otherNamedSetPos,
          );

        let theSog = sharedOrderGroups.find(v => v.name === name);

        if (!theSog) {
          const idx = sharedOrderGroups.push({
            name: name,
            lastMinute: false,
            sets: [],
            dictator: false, // will be determined at a later stage
          });

          theSog = sharedOrderGroups[idx - 1];
        }

        theSog.sets.push(...correspondingSets);
        theSog.sets.sort();

        if (isLastMinute) {
          theSog.lastMinute = true;
        }
      });

    return sharedOrderGroups
  }

  function processRenderDirectives(originalStructure, defaultStyle, namedSets) {
    const styleDefinitions  = [
      {
        name: 'default',
        stylings: defaultStyle,
      },
      {
        name: 'none',
        stylings: {
          display: 'none',
        },
      },
      {
        name: 'block',
        stylings: {
          display: 'block',
          openDelim: '',
          closeDelim: '',
          fieldPadding: 0,
        },
      },
    ];

    const styleRegex = new RegExp(
      `^\\$(?:style|s)\\(` +
      `(${namePattern})` +
      `\\s*,\\s` +
      `(.*)` + // styling directives
      `\\)$`
    );

    const afterColonRegex = new RegExp(':(.*)$');

    originalStructure
      .flat()
      .map(v => [...v, v[2].match(styleRegex)])
      .filter(v => v[3])
      .forEach(v => {

        const [
          _,
          name,
          stylingDirectives,
        ] = v[3];

        let sd = styleDefinitions.find(v => v.name === name);

        if (!sd) {
          const idx = styleDefinitions.push({
            name: name,
            stylings: {}
          });

          sd = styleDefinitions[idx - 1];
        }

        stylingDirectives
          .split(',')
          .map(v => v.trim())
          .forEach(v => {

            if (v.startsWith('od:') || v.startsWith('openDelim:')) {
              sd.stylings['openDelim'] = v.match(afterColonRegex)[1];
            }
            else if (v.startsWith('cd:') || v.startsWith('closeDelim:')) {
              sd.stylings['closeDelim'] = v.match(afterColonRegex)[1];
            }
            else if (v.startsWith('fs:') || v.startsWith('fieldSeparator:')) {
              sd.stylings['fieldSeparator'] = v.match(afterColonRegex)[1];
            }
            else if (v.startsWith('fp:') || v.startsWith('fieldPadding:')) {
              const value = Number(v.match(afterColonRegex)[1]);
              if (value >= 0) {
                sd.stylings['fieldPadding'] = value;
              }
            }

            else if (v.startsWith('clrs:') || v.startsWith('colors:')) {
              sd.stylings['colors'] = v.match(afterColonRegex)[1].split(':');
            }
            else if (v.startsWith('clss:') || v.startsWith('classes:')) {
              sd.stylings['classes'] = v.match(afterColonRegex)[1].split(':');
            }

            else if (v.startsWith('rclrs:') || v.startsWith('ruleColors:')) {
              sd.stylings['ruleColors'] = v.match(afterColonRegex)[1].split(':');
            }
            else if (v.startsWith('rclss:') || v.startsWith('ruleClasses:')) {
              sd.stylings['ruleClasses'] = v.match(afterColonRegex)[1].split(':');
            }

            else if (v.startsWith('ci:') || v.startsWith('collectiveIndexing:')) {
              const value = v.match(afterColonRegex)[1];
              const bool = value === 'true'
                ? true
                : value === 'false'
                  ? false
                  : null;

              if (typeof bool === 'boolean') {
                sd.stylings['collectiveIndexing'] = bool;
              }
            }
            else if (v.startsWith('rsi:') || v.startsWith('randomStartIndex:')) {
              const value = v.match(afterColonRegex)[1];
              const bool = value === 'true'
                ? true
                : value === 'false'
                  ? false
                  : null;

              if (typeof bool === 'boolean') {
                sd.stylings['randomStartIndex'] = bool;
              }
            }

            else if (v.startsWith('dp:') || v.startsWith('display:')) {
              sd.stylings['display'] = v.match(afterColonRegex)[1];
            }
          });
      });

    const styleApplications = [];
    const styleRules = [];

    const applyRegex = new RegExp(
      `^\\$(?:apply|app|a)\\(` +
      `(${namePattern})` +
      `(?:\\s*,\\s` +
      `(?:` + // second arg
      `(\\d+)|(n-\\d+)|((?:\\+|-)\\d+)|` + // numbered set
      `(${namePattern})(?::(\\d+|n?-\\d+))?` + // named set arg
      `)` +
      `)?` +
      `\\)$`
    );

    originalStructure
      .flat()
      .map(v => [...v, v[2].match(applyRegex)])
      .filter(v => v[3])
      .forEach(v => {

        const [
          _,
          stylingName,
          absolutePos,
          absolutePosFromEnd,
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        ] = v[3];

        if (styleDefinitions.find(v => v.name === stylingName)) {
          const correspondingSets = getCorrespondingSets(
            originalStructure,
            namedSets,
            absolutePos,
            absolutePosFromEnd,
            v[0],
            relativePos,
            otherNamedSet,
            otherNamedSetPos,
          );

          correspondingSets
            .forEach(set => styleApplications[set] = stylingName);
        }
      });

    return [styleDefinitions, styleApplications, styleRules]
  }

  function processCommands(originalStructure, numberedSets, sharedElementsGroups) {
    const result = [];

    const idxRegex      = `(?:(\\d+)|((?:\\+|-)\\d+)|n(-\\d+)|(${namePattern}))`;
    const positionRegex = ':(?:\\+?(\\d+)|n?(-\\d+))';

    const mainRegex = new RegExp(
      `^\\$(?:(c|copy)|(m|move)|(d|del|delete))\\(` +
      `(?:` +
      `(\\d+)` + // amount
      `(?:` +
      `\\s*,\\s*` +
      `${idxRegex}(?:${positionRegex})?` + // fromPosition
      `(?:` +
      `\\s*,\\s*` +
      `${idxRegex}(?:${positionRegex})?` + // toPosition
      `)?` +
      `)?` +
      `)?\\)$`
    );

    for (const elem of originalStructure.flat()) {
      const patternResult = elem[2]
        .match(mainRegex);

      // pr[1]: copySymbol, pr[2]: moveSymbol, pr[3]: deleteSymbol
      // pr[4]: amount
      // pr[5]: absIdx, pr[6]: relIdx, pr[7]: endIdx, pr[8]: nameIdx,
      // pr[9]: posIdx, pr[10]: negIdx,
      // pr[11]: absIdx, pr[12]: relIdx, pr[13]: endIdx, pr[14]: nameIdx,
      // pr[15]: posIdx, pr[16]: negIdx,
      if (patternResult) {

        const cmdName = patternResult[1]
          ? 'c'
          : patternResult[2]
          ? 'm'
          : patternResult[3]
          ? 'd'
          : '';

        const amount = patternResult[4]
          ? Number(patternResult[4])
          : 999;

        // is converted to a single numbered list in here
        const [
          toSetName,
          toSetNameWasDefined,
        ] = processSetIndex(
          patternResult[11],
          patternResult[12],
          patternResult[13],
          patternResult[14],
          elem[0],
          originalStructure.length,
          sharedElementsGroups,
        );

        const toSetPosition = processPositionIndex(
          patternResult[15],
          patternResult[16],
          toSetNameWasDefined,
          toSetName[0] ? toSetName[0] : elem[0],
          numberedSets,
          elem[1],
        );

        const [toSetNameNew, toSetPositionNew] = numberedSets
          .filter(v => toSetName.includes(v.name))
          .reduce((accu, sl, i, arr) => {
            return accu[1] - (sl.elements.length + 1) < 0
              ? [accu[0] || sl.name, accu[1]]
              : [null, accu[1] - (sl.elements.length + 1)]
          }, [null, toSetPosition]);

        // will stay a list -> is further computed
        // in applyCommand
        const [fromSetName, _] = processSetIndex(
          patternResult[5],
          patternResult[6],
          patternResult[7],
          patternResult[8],
          elem[0],
          originalStructure.length,
          sharedElementsGroups,
        );

        const fromSetPosition = processPositionIndex(
          patternResult[9],
          patternResult[10],
          true,
          elem[0],
          numberedSets,
          elem[1],
        );

        if (
          fromSetName !== null &&
          toSetNameNew !== null &&
          amount > 0
        ) {

          result.push([
            cmdName,
            amount,
            fromSetName,
            fromSetPosition,
            toSetNameNew,
            toSetPositionNew,
          ]);
        }
      }
    }

    return result
  }

  function processSetIndex(
    absIndex,
    relIndex,
    endIndex,
    nameIndex,
    currentIndex,
    elemCount,
    sharedElementsGroups,
  ) {

    if (absIndex) /* absolute index */ {
      const result = Number(absIndex);
      return elemCount <= result
        ? [[], true]
        : [[result], true]
    }

    else if (relIndex) /* relative index */ {
      const result = currentIndex + Number(relIndex);
      return result < 0
        ? [[], true]
        : elemCount < result
        ? [[], true]
        : [[result], true]
    }

    else if (endIndex) /* from end index */ {
      const result = elemCount + (Number(endIndex) - 1);
      return result < 0
        ? [[], true]
        : [[result], true]
    }

    else if (nameIndex) /* named set */ {
      // named set, I don't need to check name constraints
      // because, you only refer to named sets, not create them
      const foundSeg = sharedElementsGroups
        .find(seg => seg.name === nameIndex);

      return foundSeg
        ? [foundSeg.sets, true]
        : [[], true]
    }

    else {
      return [[currentIndex], false]
    }
  }

  const processPositionIndex = function(
    absIndex,
    negIndex,
    setNameWasDefined,
    setName,
    numberedSets,
    inSetIdx,
  ) {

    if (absIndex !== undefined) {
      return absIndex
    }
    else if (negIndex !== undefined) {
      return negIndex
    }
    else if (setNameWasDefined) {
      return 0
    }

    else {
      // otherwise, calculate its position in context of its idx
      // using the numbered sets
      return numberedSets
        .find(v => v.name === setName)
        .elements
        .reduce((accu, v) =>
          v[1] < inSetIdx
            ? accu + 1
            : accu,
          0
        )
    }
  };

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

  // important for collective color indexing
  function reorderForRendering(structureMatches, reorderings) {

    const result = Array(reorderings.length);

    for (const [i, ro] of reorderings
      .map((v, i) => ({
        rendering: v,
        order: i
      }))
      .entries()
    ) {

      const match = structureMatches.find(v => i === v.to);

      if (match) {
        result[match.from] = ro;
      }
      else {
        result.push(ro);
      }
    }

    return result
      .filter(v => v !== undefined)
  }

  function main(
    frontside,
    inputSyntax,
    defaultStyle,
    originalStructureInherited,
    generatorValuesInherited,
    reordersInherited,
    reordersSecondInherited,
    randomIndicesInherited,
  ) {
    const form = formatter(inputSyntax);
    const originalStructure = form.getOriginalStructure();

    if (form.isValid && (!frontside || !form.isContained) && originalStructure.length > 0) {

      const structureMatches = matchStructures(
        originalStructure,
        originalStructureInherited
      );

      //////////////////////////////////////////////////////////////////////////////
      // FIRST RANDOMIZATION
      const [numberedSets, generatorValues] = processNumberedSets(
        originalStructure,
        matchGeneratorValues(
          matchStructures(originalStructure, originalStructureInherited),
          generatorValuesInherited,
        ),
      );

      const segs     = processSharedElementsGroups(originalStructure);
      const sogs     = processSharedOrderGroups(originalStructure, segs);
      const commands = processCommands(originalStructure, numberedSets, segs);
      const [
        stylingDefinitions,
        stylingAssignments,
      ] = processRenderDirectives(originalStructure, defaultStyle, segs);

      const [elements, reordersAlpha] = generateRandomization(numberedSets, segs);

      const reorders = applyInheritedSetReorder(
        reordersAlpha,
        reordersInherited,
        structureMatches,
      );

      applyModifications(reorders, elements, sogs, commands);

      //////////////////////////////////////////////////////////////////////////////
      // SECOND RANDOMIZATION
      const [numberedSetsSecond, _] = processNumberedSets(
        elements.map(set => set.filter(elem => elem[3] !== 'd')),
        [],
      );

      const [elementsSecond, reordersSecondAlpha] = generateRandomization(
        numberedSetsSecond
          .map((v, i) => ({
            name: v.name,
            elements: v.elements,
            lastMinute: numberedSets[i].lastMinute
          })),
        segs,
      );

      const reordersSecond = applyInheritedSetReorder(
        reordersSecondAlpha,
        reordersSecondInherited,
        structureMatches,
      );

      applyModifications(
        reordersSecond.filter(v => v.lastMinute),
        elementsSecond,
        sogs.filter(v => v.lastMinute),
        [],
      );

      //////////////////////////////////////////////////////////////////////////////
      // RENDERING
      const randomIndices = form.renderSets(
        reorderForRendering(structureMatches, elementsSecond),
        stylingDefinitions,
        stylingAssignments,
        randomIndicesInherited,
        numberedSets,
      );

      //////////////////////////////////////////////////////////////////////////////
      return [
        originalStructure,
        generatorValues,
        reorders,
        reordersSecond,
        randomIndices,
      ]
    }

    else {
      return [
        originalStructure,
        [/* generatorValues */],
        [/* reorders */],
        [/* reordersSecond */],
        {/* randomIndices */},
      ]
    }
  }

  // numbered are sorted 0 -> n, then named are in order of appearance
  function applyModifications(reorders, elements, sogs, commands) {

    // modifies reorders
    shareOrder(reorders, sogs);

    // both modify elements
    applySetReorder(reorders, elements);
    applyCommands(commands, elements);
  }

  // document.addEventListener("DOMContentLoaded", function() {
  if (window.Persistence && Persistence.isAvailable() &&
     (document.querySelector('div#qa') === null ||
       !(new RegExp('// \S\E\T RANDOMIZER BACK TEMPLATE'))
       .test(document.querySelector('div#qa').innerHTML))) {
    mainFront();
  }
  // })

  function getNullData() {
    return [
      [/* originalStructure */],
      [/* generatorValues */],
      [/* reorders */],
      [/* reordersSecond */],
      {/* randomIndices */},
    ]
  }

  function mainFront() {

    const options = $$options;

    const theSaveData = options
      .reduce((accu, v) => {

        const saveData = main(
          true,
          v.inputSyntax,
          v.defaultStyle,
          ...accu[1],
        );

        return [
          (accu[0].push([
            v.inputSyntax,
            v.defaultStyle,
            ...saveData,
          ]), accu[0]),
          saveData,
        ]
      }, [
        [/* SRData to be */],
        getNullData(),
      ])[0];

    saveData(theSaveData);
  }

}());
