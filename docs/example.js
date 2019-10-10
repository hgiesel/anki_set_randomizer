(function () {
  'use strict';

  const dataName = 'SRData';

  function saveData(theSaveData) {
    Persistence.removeItem(dataName);
    Persistence.setItem(dataName, theSaveData);
  }

  function createWarningNotDefined() {
    if (!document.querySelector('#set-randomizer--warning')) {
      document.body.querySelector('#qa').appendChild(getWarningDiv(
        'Set-Randomizer: Anki-Persistence is not defined!\n' +
        'Check "Tools > Set Randomizer Options" and make sure you enable "Inject anki-persistence".'
      ));
    }
  }

  function createWarningNotAvailable(wereSetsUsed) {
    if (wereSetsUsed /* only show Warning if you used some sets at all */ && !document.querySelector('#set-randomizer--warning')) {
      document.body.querySelector('#qa').appendChild(getWarningDiv(
        'Set-Randomizer: Anki-Persistence <a href="https://github.com/SimonLammer/anki-persistence">does not work here</a>. Randomization will be inconsistent.'
      ));
    }
  }

  function getWarningDiv(warningMessage) {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'set-randomizer--warning';
    warningDiv.innerHTML = warningMessage;
    warningDiv.style.cssText = (
      'color: firebrick;' +
      'font-size: 40%; ' +
      'background-color: white; ' +
      'border: 2px solid red; ' +
      'margin: 40px 10px 0px; ' +
      'padding: 15px; ' +
      'text-shadow: 0px 0px; ' /* avoid text-shadow from somewhere else */
    );
    return warningDiv
  }

  function getNullData() {
    return [
      [/* elementsInherited */],
      [/* generatedValues */],
      [/* uniquenessConstraints */],
      [/* reordersFirst */],
      [/* reordersSecond */],
      {/* randomIndices */},
    ]
  }

  const namePattern     = '(?:[a-zA-Z_][a-zA-Z0-9_\\-]*|\\*)';
  const positionPattern = `:(?:(n(?:-\\d+)?|-\\d|\\d+)|(\\*))`;

  const star = {"star":true};

  function partitionList(list, spacing) {
      const output = [];

      for (let i = 0; i < list.length; i += spacing) {
          output[output.length] = list.slice(i, i + spacing);
      }

      return output
  }

  // evaluates named set args in $n(), $o(), or $a()
  function getCorrespondingSets(
    elements,
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
      correspondingSets = [elements.length + offset - 1];
    }
    else if (relativePos) {
      const idx = currentPos + Number(relativePos);

      correspondingSets = elements[idx]
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
          : elements.length + Number(otherNamedSetPos) - 1;

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

  function escapeString(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function treatNewlines(text) {
    return text
      .replace(RegExp('</div><div>', 'g'), '<br>')
      .replace(RegExp('<div>', 'g'), '<br>')
  }

  function compareArrays(array, otherArray) {
    if (!otherArray || array.length !== otherArray.length) {
      return false
    }

    for (let i = 0, l = array.length; i < l; i++) {
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

  /**
   * For all funtions that concerns accessing the html content
   */

  function formatter(inputSyntax, iterIndex) {

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

    const elemDelim = '%%sr%%ELEMDELIM%%';

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
    const _elementsOriginal = {};
    const getElementsOriginal = function(theSelector=inputSyntax.cssSelector) {
      if (_elementsOriginal[theSelector]) {
        return _elementsOriginal[theSelector]
      }

      else {
        const theElementsOriginal = [];
        const theFoundStructure = getFoundStructure(theSelector);

        for (const [i, group] of theFoundStructure.entries()) {
          const splitGroup = group
            .split(inputSyntax.isRegex
              ? new RegExp(inputSyntax.fieldSeparator)
              : inputSyntax.fieldSeparator)
            .map((elem, j) => [iterIndex, i, j, elem, 'n']);

          theElementsOriginal.push(splitGroup);
        }

        return _elementsOriginal[theSelector] = theElementsOriginal
      }
    };

    const valuePicker = function(valueSets, styleRules) {

      const valueRegex = new RegExp('%%(.+)%%(\\d+)%%(\\d+)%%');

      const pickStyle = function(elements) {

        for (let i = elements.length - 1; i >= 0 ;i--) {

          let m;
          if (m = elements[i].match(valueRegex)) {
            const valueSetName = m[1];
            const valueSubSet  = Number(m[2]);
            const valueIndex   = Number(m[3]);

            const theValue = styleRules.find(v =>
              (v[1] == star || v[1] === valueSetName) &&
              (v[2] == star || v[2] === valueSubSet) &&
              (v[3] == star || v[3] === valueIndex)
            );

            if (theValue !== undefined) {
              return theValue[0]
            }

          }
        }

        return null
      };

      const pickValue = function(name, colorRules, classRules) {

        const m = name.match(valueRegex);

        if (!m) {
          return name
        }

        const valueSetName = m[1];
        const valueSubSet  = Number(m[2]);
        const valueIndex   = Number(m[3]);

        let theValue;
        try {
          theValue = valueSets[valueSetName][valueSubSet].values[valueIndex];
          if (theValue === undefined) {
            throw 'error'
          }
        }
        catch {
          return null
        }

        const theColor = colorRules ? colorRules.find(v =>
          (v[1] == star || v[1] === valueSetName) &&
          (v[2] == star || v[2] === valueSubSet) &&
          (v[3] == star || v[3] === valueIndex)) : null;

        const theClass = classRules ? classRules.find(v =>
          (v[1] == star || v[1] === valueSetName) &&
          (v[2] == star || v[2] === valueSubSet) &&
          (v[3] == star || v[3] === valueIndex)) : null;

        const theColorCss = theColor ? ` style="color: ${theColor[0]}"` : '';
        const theClassCss = theClass ? ` class="${theClass[0]}"` : '';

        const result = `<span${theColorCss}${theClassCss}>${theValue}</span>`;

        return result
      };

      return {
        pickStyle: pickStyle,
        pickValue: pickValue,
      }
    };

    const stylingsAccessor = function(styleDefinitions, randomIndices) {

      const defaultStyle = styleDefinitions.find(v => v.name === 'default').stylings;

      const propAccessor = function(appliedStyleName, ruleStyleName=null, theDefaultStyle=defaultStyle) {

        const theAppliedStyle = appliedStyleName
          ? styleDefinitions.find(v => v.name === appliedStyleName).stylings
          : null;

        const theRuleStyle = ruleStyleName
          ? styleDefinitions.find(v => v.name === ruleStyleName).stylings
          : null;

        const getProp = function(propName=null, propNameSub=null) {

          if (propName && propNameSub) {

            if (theRuleStyle && theRuleStyle[propName] && theRuleStyle[propName][propNameSub] !== undefined) {
              return theRuleStyle[propName][propNameSub]
            }
            else if (theAppliedStyle && theAppliedStyle[propName] && theAppliedStyle[propName][propNameSub] !== undefined) {
              return theAppliedStyle[propName][propNameSub]
            }
            else {
              return theDefaultStyle[propName][propNameSub]
            }

          }
          else if (propName) {

            if (theRuleStyle && theRuleStyle[propName] !== undefined) {
              return theRuleStyle[propName]
            }
            else if (theAppliedStyle && theAppliedStyle[propName] !== undefined) {
              return theAppliedStyle[propName]
            }
            else {
              return theDefaultStyle[propName]
            }

          }
          else {
            return theRuleStyle || theAppliedStyle || theDefaultStyle
          }
        };

        let currentIndex;

        const getNextIndex = function(type /* colors or classes */) {

          let theIndex;
          const theProp = getProp(type);
          const propValueLength = getProp(type, 'values').length;

          if (currentIndex === undefined) {
            if (theProp.collectiveIndexing && theProp.randomStartIndex) {

              if (theProp.randomIndices.length === 0) {
                theIndex = Math.floor(Math.random() * propValueLength);
                theProp.randomIndices.push(theIndex);
              }
              else {
                theIndex = theProp.nextIndex === 0
                  ? theProp.randomIndices[0]
                  : theProp.nextIndex % propValueLength;
              }
            }

            else if (theProp.collectiveIndexing) {
              theIndex = theProp.nextIndex % propValueLength;
            }

            else if (theProp.randomStartIndex) {

              if (!theProp.setIndex) {
                theProp.setIndex = 0;
              }

              theIndex = theProp.randomIndices[theProp.setIndex];

              if (theIndex === undefined) {
                theIndex = Math.floor(Math.random() * propValueLength);
                theProp.randomIndices.push(theIndex);
              }

              theProp.setIndex += 1;
            }

            else {
              theIndex = 0;
            }
          }

          else {
            theIndex = ++currentIndex % propValueLength;
          }

          currentIndex = theIndex;
          theProp.nextIndex = currentIndex + 1;

          return theIndex
        };

        return {
          getProp: getProp,
          getNextIndex: getNextIndex,
        }

      };

      const importIndices = function() {

        styleDefinitions
          .forEach(def => {
  ['colors', 'classes'].forEach(type => {
              def.stylings[type].randomIndices = randomIndices[def.name]
                ? randomIndices[def.name][type]
                : [];
              def.stylings[type].nextIndex = 0;
            });
          });
      };

      const exportIndices = function() {
        const result = {};

        styleDefinitions
          .forEach(def => {
            result[def.name] = {}

            ;['colors', 'classes'].forEach(type => {
              result[def.name][type] = def.stylings[type].randomIndices;
            });
          });

        return result
      };

      importIndices();

      return {
        defaultStyle: defaultStyle,
        propAccessor: propAccessor,
        exportIndices: exportIndices,
      }
    };

    const renderSets = function(
      reordering,
      styleDefinitions,
      styleApplications,
      styleRules,
      randomIndices,
      valueSets,
      numberedSets,
      theSelector=inputSyntax.cssSelector
    ) {

      const sa = stylingsAccessor(styleDefinitions, randomIndices);
      const vp = valuePicker(valueSets, styleRules);

      console.log('sd', styleDefinitions);

      const stylizedResults = Array(reordering.length);

      for (const set of reordering) {

        const actualValues = [];
        const styleName = styleApplications[set.order];
        const pa = sa.propAccessor(styleName, vp.pickStyle(set
          .rendering
          .map(v => v[3])
        ));

        if (pa.getProp('display') === 'sort') {
          set.rendering.sort();
        }
        else if (pa.getProp('display') === 'orig') {
          set.rendering = numberedSets.find(v => v.name === set.order).elements;
        }

        for (const elem of set.rendering) {

          const [
            _,
            setIndex,
            elemIndex,
            elemContent,
            elemType,
          ] = elem;


          if (elemType !== 'd') {
            const theIndex = pa.getNextIndex('colors');

            const colorChoice = !Number.isNaN(theIndex)
              ? ` color: ${pa.getProp('colors', 'values')[theIndex]};`
              : '';

            const className = `class="set-randomizer--element set-randomizer--element-index-${setIndex}-${elemIndex}"`;
            const blockDisplay = pa.getProp('block')
              ? ' display: block;'
              : '';

            const style = `style="padding: 0px ${pa.getProp('fieldPadding')}px;${colorChoice}${blockDisplay}"`;

            const pickedValue = vp.pickValue(elemContent, pa.getProp('colors', 'rules'), pa.getProp('classes', 'rules'));

            if (pickedValue) {

              const theValue = pa.getProp('block')
                ? `<record ${className} ${style}><div>${treatNewlines(elemContent)}</div></record>`
                : `<record ${className} ${style}>${pickedValue}</record>`;

              actualValues.push(theValue);
            }
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
        const olParse = getElementsOriginal('div#original').flat();

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
      getElementsOriginal: getElementsOriginal,
      renderSets: renderSets,
      isValid: isValid,
    }
  }

  // modifies in-place (!)
  function rotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
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
          (accu, v) => accu || sr.sets.every(srv => {
            return v.some(v => compareArrays(v, srv))
          }),
          false
        );

      if (!alreadySorted) {

        const flatSaveElems = sr
          .sets
          .map(v => elems[v[1]])
          .flat();

        sliceWithLengths(
          sortWithIndices(flatSaveElems, sr.order),
          sr.setLengths
        )
          .forEach((v, i) => {
            elems[sr.sets[i][1]] = v;
          });

        appliedSrs.push(sr.sets);
      }
    }
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
      const elemType = elem[4];

      if (elemType !== 'd' && elemType !== 'c') {

        capturedElements.push(elem.slice(0));

        if (cmdName === 'd' || cmdName === 'm') {
          // modifies elems
          elem[4] = 'd';
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
      .forEach(v => v.splice(4, 1, 'c'));

    // insert elements to new position
    if ((cmdName === 'c' || cmdName === 'm') && capturedElements.length > 0) {

      let elemCount   = contentElementCount;
      let thePosition = 0;

      thePosition += elems[toSet]
        .slice(thePosition)
        .findIndex(v => v[4] === 'n' || v[4] === 'd');

      while (elemCount > 0) {
        thePosition += elems[toSet]
          .slice(thePosition)
          .findIndex(v => v[4] === 'n' || v[4] === 'd');
        thePosition++;
        elemCount--;
      }

      if (thePosition === -1) {
        thePosition = elems[toSet].length;
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

  function generateRandomValue(min, max, extra, isReal) {
    const preValue = Math.random() * (max - min) + min;

    return isReal
      ? preValue.toFixed(extra || 2)
      : (Math.round(preValue) * (extra || 1)).toString()
  }

  function generateValue(name, subsetIndex, valueIndex) {
    return `%%${name}%%${subsetIndex}%%${valueIndex}%%`
  }

  // also processes generator patterns
  function processNumberedSets(
    elements,
    generatedValues,
    uniquenessConstraints,
    iterIndexCurr,
    lastMinutes=[],
  ) {

    const [
      evaluators,
    ] = evalEvaluations(elements);

    const [
      valueSets,
      valueSetEvaluations,
    ] = evalValueSets(elements, evaluators, uniquenessConstraints, generatedValues);

    const [
      result,
    ] = evalPicks(elements, valueSets, valueSetEvaluations, uniquenessConstraints, generatedValues, iterIndexCurr, lastMinutes);

    return [result, generatedValues, uniquenessConstraints, valueSets]
  }

  function evalEvaluations(elements) {
    const evaluators = [];

    const evaluatorPattern = new RegExp(
      `^\\$(?:evaluate|eval|e)\\(` +
      `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
      `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)` +
      `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
    );

    for (const elem of elements.flat()) {
      let match;

      const theElem = elem[3];

      // evaluations
      if (match = theElem.match(evaluatorPattern)) {

        const count = match[1];
        const valueSetName = match[2];

        const maybeNumberSetIndex = Number(match[3]);
        const maybeNumberValueIndex = Number(match[5]);

        const uniquenessConstraint = match[7];

        evaluators.push([
          valueSetName === '*' ? star : valueSetName,
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

  function evalValueSets(elements, evaluators, uniquenessConstraints, generatedValues) {
    const valueSets = {};
    const valueSetEvaluations = [];

    const valueSetPattern = new RegExp(
      `^\\$(${namePattern})(!)?(?!\\()(\\W)((?:.|\\n|\\r)*)`
    );

    // modifies evaluators !!!!!
    evaluators.reverse();
    const newLinePattern = new RegExp(`\\\\n`, 'g');
    const catchPattern = new RegExp(`\\\\.`, 'g');

    for (const elem of elements.flat()) {
      let match;

      const [
        iterIndex,
        setIndex,
        elemIndex,
        theElem,
      ] = elem;

      // value set shortcut
      if (match = theElem.match(valueSetPattern)) {

        const valueSetName     = match[1];
        const isSelfEvaluating = match[2] === '!' ? true : false;

        const values = match[4]
          .replace(`\\${match[3]}`, '%%sr%%ESCDELIM%%')
          .replace(newLinePattern, '<br/>')
          .replace(catchPattern, (x) => x.slice(1))
          .split(match[3])
          .map(v => v.replace('%%sr%%ESCDELIM%%', match[3]));

        const valueSetIndex = (valueSets[valueSetName] || (valueSets[valueSetName] = [])).push({
          name: valueSetName,
          idx: valueSets[valueSetName] ? valueSets[valueSetName].length : 0,
          values: values,
          iter: iterIndex,
          set: setIndex,
          pos: elemIndex,
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

          const valueId = foundEvaluator[2];
          const valueCount = foundEvaluator[3];
          const uniquenessConstraintName = foundEvaluator[4];

          if (
            uniquenessConstraintName &&
            !uniquenessConstraints.find(v => v.name === uniquenessConstraintName)
          ) {
            uniquenessConstraints.push({
              name: uniquenessConstraintName,
              values: []
            });
          }

          let pregen;
          if (pregen = generatedValues
            .find(gv => gv[0] === iterIndex && gv[1] === setIndex && gv[2] === elemIndex)) {

            resolvedValues.push(...pregen[3]);

            /* does not need to inherited again */
            wasStar = false;
          }

          else {

            for (let failedOnce = false, i = 0; i < valueCount; i++) {

              if (failedOnce) {
                break
              }

              let theValue = generateValue(
                valueSetName,
                valueSetIndex,
                valueId !== star ? valueId : Math.floor(Math.random() * values.length),
              );

              if (uniquenessConstraintName) {

                let countIdx = 0;
                const countIdxMax = 100;

                const uc = uniquenessConstraints
                  .find(v => v.name === uniquenessConstraintName)
                  .values;

                while (uc.includes(theValue) && countIdx < countIdxMax) {

                  theValue = generateValue(
                    valueSetName,
                    valueSetIndex,
                    Math.floor(Math.random() * values.length),
                  );

                  if (valueId !== star) {
                    countIdx = countIdxMax;
                  }
                  else {
                    countIdx++;
                  }
                }

                if (countIdx === countIdxMax) {
                  theValue = null;
                  failedOnce = true;
                }

                else {
                  uniquenessConstraints
                    .find(v => v.name === uniquenessConstraintName)
                    .values
                    .push(theValue);
                }
              }

              if (theValue !== null && theValue !== undefined) {
                resolvedValues.push(theValue);
              }
            }
          }
        }

        else if (isSelfEvaluating) {
          // even though technically it is star, the result is still predictable
          wasStar = false;

          resolvedValues.push(...Array.from(
            valueSets[valueSetName][valueSetIndex].values.keys(),
            idx => generateValue(
              valueSetName,
              valueSetIndex,
              idx
            ),
          ));
        }

        if (resolvedValues.length > 0) {
          valueSetEvaluations.push([
            iterIndex,
            setIndex,
            elemIndex,
            resolvedValues,
            wasStar,
          ]);
        }
      }
    }

    return [
      valueSets,
      valueSetEvaluations,
    ]
  }

  function evalPicks(
    elements,
    valueSets,
    valueSetEvaluations,
    uniquenessConstraints,
    generatedValues,
    iterIndex,
    lastMinutes,
  ) {

    const result = [];
    const lastMinutePattern = new RegExp(`^\\$(n|name)!\\(\\)$`);

    const intPattern       = '\\d+';
    const realOrIntPattern = `${intPattern}(?:\\.\\d*)?`;
    const realIntGenerator =
      `(${realOrIntPattern}):(${realOrIntPattern})(?::(${intPattern}))?`;

    const pickPattern = new RegExp(
      `^\\$(?:pick|p)\\(` +
      `(?:\\s*(\\d+)\\s*,\\s*)?` + // count
      `(?:${realIntGenerator}|` +
      `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)?)` + // picking from value sets
      `(?:\\s*,\\s*(${namePattern})\\s*)?` // uniqueness constraint
    );

    const contentElementPattern = new RegExp('^[^\\$]');

    for (const [i, set] of elements.entries()) {

      const contentElements = [];
      let lastMinute = lastMinutes[i] || false;

      for (const elem of set) {

        let match;

        const [
          iterIndex,
          setIndex,
          elemIndex,
          theElem,
        ] = elem;

        if (!lastMinute && lastMinutePattern.test(theElem)) {
          lastMinute = true;
        }

        else if (match = valueSetEvaluations.find(v => v[1] === setIndex && v[2] === elemIndex)) {

          const theElements     = match[3];
          const needsInheriting = match[4];

          if (needsInheriting) {
            generatedValues.push([iterIndex, setIndex, elemIndex, theElements]);
          }

          contentElements.push(...theElements.map(w => [iterIndex, setIndex, elemIndex, w]));
        }

        else if (match = theElem.match(pickPattern)) {

          const count =
            match[1] !== undefined
            ? Number(match[1]) : 1;

          const uniquenessConstraintName = match[10];

          const minValue   = match[2];
          const maxValue   = match[3];
          const extraValue = match[4];

          const valueSetName = match[5];

          const maybeValueSetSetIndex   = Number(match[6]);
          const maybeValueSetValueIndex = Number(match[8]);

          const valueSetNameName = valueSetName === '*'
            ? star
            : valueSetName;

          console.log('pick:vsn', valueSetNameName);

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
          const theUc = uniquenessConstraints
            .find(v => v.name === uniquenessConstraintName);

          let pregen;
          if (pregen = generatedValues
            .find(v =>
              v[0] === iterIndex &&
              v[1] === setIndex &&
              v[2] === elemIndex)) {
            resultValues.push(...pregen[3]);
          }

          else {

            for (let failedOnce = false, i = 0; i < count; i++) {
              let resultValue;

              if (failedOnce) {
                break;
              }

              if (minValue && maxValue /* number pick */) {
                // generate a random integer or real number
                const isReal = minValue.includes('.') || maxValue.includes('.');

                resultValue = generateRandomValue(
                  Number(minValue),
                  Number(maxValue),
                  Number(extraValue),
                  isReal,
                );

                /* dealing with uc */
                if (theUc) {
                  let countIdx = 0;
                  const countIdxMax = 100;

                  while (theUc.values.includes(resultValue) &&
                    countIdx < countIdxMax) {

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
                    failedOnce = true;
                  }
                }
              }

              else /* value set pick */ {

                const foundValueSet = valueSets[
                  valueSetNameName === star
                  ? Object.keys(valueSets)[Math.floor(Math.random() * Object.keys(valueSets).length)]
                  : valueSetNameName
                ];

                const vidx = valueSetSetIndex === star
                  ? Math.floor(Math.random() * foundValueSet.length)
                  : valueSetSetIndex;

                const foundValueSubSet = foundValueSet && foundValueSet.length > 0
                  ? foundValueSet[vidx]
                  : null;

                if (foundValueSubSet) {
                  if (valueSetValueIndex === star) {
                    const randomIndex = Math.floor(Math.random() * foundValueSubSet.values.length);
                    resultValue = generateValue(foundValueSubSet.name, vidx, randomIndex);
                  }
                  else {
                    resultValue = generateValue(foundValueSubSet.name, vidx, valueSetValueIndex);
                  }
                }

                /* dealing with uc */
                if (resultValue && theUc) {
                  let countIdx = 0;
                  const countIdxMax = 100;

                  while (theUc.values.includes(resultValue) && countIdx < countIdxMax) {

                    const randomIndex = Math.floor(Math.random() * foundValueSubSet.values.length);
                    resultValue = generateValue(foundValueSubSet.name, vidx, randomIndex);

                    countIdx++;
                  }

                  if (countIdx == countIdxMax) {
                    resultValue = null;
                    failedOnce = true;
                  }
                }
              }

              /* adding to resultValues */
              if (resultValue !== undefined && resultValue !== null) {

                if (theUc) {
                  theUc.values.push(resultValue);
                }

                resultValues.push(resultValue);
              }
            }

            if (resultValues.length > 0 && (valueSetNameName === star || valueSetSetIndex === star || valueSetValueIndex === star)) {
              generatedValues.push([iterIndex, setIndex, elemIndex, resultValues]);
            }
          }

          contentElements.push(...resultValues.map(v => [iterIndex, setIndex, elemIndex, v]));
        }

        else if (contentElementPattern.test(theElem) || theElem.length === 0) {
          contentElements.push(elem);
        }
      }

      result.push({
        iter: iterIndex,
        name: i,
        elements: contentElements,
        lastMinute: lastMinute,
      });
    }

    return [
      result,
    ]
  }

  function processNamedSets(elementsOriginal) {

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

    const namedSets = [];

    elementsOriginal
      .flat()
      .map(v => [v, v[3].match(namedSetPattern)])
      .filter(v => v[1])
      // sort self-referring sets to beginning
      .reduce((accu, v) => {
        v[1][3] || v[1][4] || v[1][5] || v[1][6] || v[1][7]
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
        ] = v[1];

        const correspondingSets = getCorrespondingSets(
          elementsOriginal,
          namedSets,
          absolutePos,
          absolutePosFromEnd,
          v[0][1],
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        );

        let theNs = namedSets.find(w => w.name === name);

        if (!theNs) {
          const idx = namedSets.push({
            iter: v[0][0],
            name: name,
            lastMinute: false,
            sets: []
          });

          theNs = namedSets[idx - 1];
        }

        theNs.sets.push(...correspondingSets);
        theNs.sets.sort();

        if (isLastMinute) {
          theNs.lastMinute = true;
        }
      });

    return namedSets
  }

  function processOrderConstraints(elementsOriginal, namedSets) {
    const orderConstraints = [];

    const orderConstraintPattern = new RegExp(
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

    elementsOriginal
      .flat()
      .map(v => [v, v[3].match(orderConstraintPattern)])
      .filter(v => v[1])
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
        ] = v[1];

        const correspondingSets = (otherNamedSet && !otherNamedSetPos)
          ? [otherNamedSet]
          : getCorrespondingSets(
            elementsOriginal,
            namedSets,
            absolutePos,
            absolutePosFromEnd,
            v[0][1],
            relativePos,
            otherNamedSet,
            otherNamedSetPos,
          );

        let theOc = orderConstraints.find(v => v.name === name);

        if (!theOc) {
          const idx = orderConstraints.push({
            name: name,
            lastMinute: false,
            sets: [],
            dictator: false, // will be determined at a later stage
          });

          theOc = orderConstraints[idx - 1];
        }

        theOc.sets.push(...correspondingSets);
        theOc.sets.sort();

        if (isLastMinute) {
          theOc.lastMinute = true;
        }
      });

    return orderConstraints
  }

  const valueSetPattern = `(?:(${namePattern})(?:(?:${positionPattern})?${positionPattern})?)`;

  function processRenderDirectives(elements, defaultStyle, namedSets) {

    const styleDefinitions  = processStyleDefinitions(elements, defaultStyle);
    const styleApplications = processStyleApplications(elements, styleDefinitions, namedSets);
    const styleRules        = processStyleRules(elements, styleDefinitions);

    return [styleDefinitions, styleApplications, styleRules]
  }

  function splitStylingDirectives(sd) {

    const result = [];
    const splitRegex = new RegExp(
      `(\\w+):` +
      `(?:\\[(.*?)\\]|(?:"(.*?)"|'(.*?)'|([^,]+)))?`, 'gm');

    let m = splitRegex.exec(sd);

    while (m) {
      const theValue = [
        m[1],
        m[2] !== undefined ? m[2] :
        m[3] !== undefined ? m[3] :
        m[4] !== undefined ? m[4] :
        m[5] !== undefined ? m[5] : '',
      ];

      result.push(theValue);
      m = splitRegex.exec(sd);
    }

    return result
  }

  function processStyleDefinitions(elements, defaultStyle) {

    const styleDefinitions  = [
      {
        name: 'default',
        stylings: defaultStyle,
      },
      {
        name: 'none',
        stylings: {
          colors: {},
          classes: {},
          display: 'none',
        },
      },
      {
        name: 'block',
        stylings: {
          colors: {},
          classes: {},
          openDelim: '',
          closeDelim: '',
          fieldPadding: 0,
          block: true,
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

    elements
      .flat()
      .map(v => [v, v[3].match(styleRegex)])
      .filter(v => v[1])
      .forEach(v => {

        const [
          _,
          name,
          stylingDirectives,
        ] = v[1];

        let sd = styleDefinitions.find(v => v.name === name);

        if (!sd) {
          const idx = styleDefinitions.push({
            name: name,
            stylings: {
              colors: {},
              classes: {},
            }
          });

          sd = styleDefinitions[idx - 1];
        }

        splitStylingDirectives(stylingDirectives)
          .forEach(v => {

            const [
              attributeName,
              attributeValue,
            ] = v;

            if (attributeName === 'od' || attributeName === 'openDelim') {
              sd.stylings['openDelim'] = attributeValue;
            }
            else if (attributeName === 'cd' || attributeName === 'closeDelim') {
              sd.stylings['closeDelim'] = attributeValue;
            }

            else if (attributeName === 'fs' || attributeName === 'fieldSeparator') {
              sd.stylings['fieldSeparator'] = attributeValue;
            }
            else if (attributeName === 'fp' || attributeName === 'fieldPadding') {
              const value = Number(attributeValue);
              if (value >= 0) {
                sd.stylings['fieldPadding'] = value;
              }
            }

            else if (attributeName === 'es' || attributeName === 'emptySet') {
              sd.stylings['emptySet'] = attributeValue;
            }

            else if (attributeName === 'clrs' || attributeName === 'colors') {
              sd.stylings['colors']['values'] = attributeValue
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);
            }
            else if (attributeName === 'clss' || attributeName === 'classes') {
              sd.stylings['classes']['values'] = attributeValue
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);
            }

            else if (attributeName === 'clrr' || attributeName === 'colorRules') {
              sd.stylings['colors']['rules'] = partitionList(attributeValue
                .split(',')
                .map(w => w.trim()), 2
              )
                .map(w => {

                  if (w.length !== 2) {
                    return w
                  }

                  const regexResult = w[1].match(`^${valueSetPattern}$`);

                  if (!regexResult) {
                    return null
                  }

                  const [
                    _,
                    valueSetName,
                    valueSetSetIndex,
                    valueSetSetStar,
                    valueSetValueIndex,
                    valueSetValueStar,
                  ] = regexResult;

                  return [
                    w[0],
                    valueSetName === '*' ? star : valueSetName,
                    valueSetSetIndex ? Number(valueSetSetIndex) : star,
                    valueSetValueIndex ? Number(valueSetValueIndex) : star,
                  ]
                })
                .filter(w => w && w.length === 4);
            }
            else if (attributeName === 'clsr' || attributeName === 'classRules') {
              sd.stylings['classes']['rules'] = partitionList(attributeValue
                .split(',')
                .map(w => w.trim()), 2
              )
                .map(w => {

                  if (w.length !== 2) {
                    return w
                  }

                  const regexResult = w[1].match(`^${valueSetPattern}$`);

                  if (!regexResult) {
                    return null
                  }

                  const [
                    _,
                    valueSetName,
                    valueSetSetIndex,
                    valueSetSetStar,
                    valueSetValueIndex,
                    valueSetValueStar,
                  ] = regexResult;

                  return [
                    w[0],
                    valueSetName === '*' ? star : valueSetName,
                    valueSetSetIndex ? Number(valueSetSetIndex) : star,
                    valueSetValueIndex ? Number(valueSetValueIndex) : star,
                  ]
                })
                .filter(w => w && w.length === 4);
            }

            else if (attributeName === 'clrci' || attributeName === 'colorsCollectiveIndexing') {
              const bool = attributeValue === 'true' || attributeValue === 'yes'
                ? true
                : attributeValue === 'false' || attributeValue === 'no'
                ? false
                : null;

              if (typeof bool === 'boolean') {
                sd.stylings['colors']['collectiveIndexing'] = bool;
              }
            }

            else if (attributeName === 'clrrsi' || attributeName === 'colorsRandomStartIndex') {
              const bool = attributeValue === 'true' || attributeValue === 'yes'
                ? true
                : attributeValue === 'false' || attributeValue === 'no'
                ? false
                : null;

              if (typeof bool === 'boolean') {
                sd.stylings['colors']['randomStartIndex'] = bool;
              }
            }


            else if (attributeName === 'clsci' || attributeName === 'classesCollectiveIndexing') {
              const bool = attributeValue === 'true' || attributeValue === 'yes'
                ? true
                : attributeValue === 'false' || attributeValue === 'no'
                ? false
                : null;

              if (typeof bool === 'boolean') {
                sd.stylings['classes']['collectiveIndexing'] = bool;
              }
            }

            else if (attributeName === 'clsrsi' || attributeName === 'classesRandomStartIndex') {
              const bool = attributeValue === 'true' || attributeValue === 'yes'
                ? true
                : attributeValue === 'false' || attributeValue === 'no'
                ? false
                : null;

              if (typeof bool === 'boolean') {
                sd.stylings['classes']['randomStartIndex'] = bool;
              }
            }

            else if (attributeName === 'blk' || attributeName === 'block') {
              const bool = attributeValue === 'true' || attributeValue === 'yes'
                ? true
                : attributeValue === 'false' || attributeValue === 'no'
                ? false
                : null;

              if (typeof bool === 'boolean') {
                sd.stylings['block'] = bool;
              }
            }

            else if (attributeName === 'dp' || attributeName === 'display') {
              sd.stylings['display'] = attributeValue;
            }
          });
      });

    return styleDefinitions
  }

  function processStyleApplications(elements, styleDefinitions, namedSets) {
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

    const styleApplications = [];

    elements
      .flat()
      .map(v => [v, v[3].match(applyRegex)])
      .filter(v => v[1])
      .forEach(v => {

        const [
          _,
          stylingName,
          absolutePos,
          absolutePosFromEnd,
          relativePos,
          otherNamedSet,
          otherNamedSetPos,
        ] = v[1];

        if (styleDefinitions.find(v => v.name === stylingName)) {
          const correspondingSets = getCorrespondingSets(
            elements,
            namedSets,
            absolutePos,
            absolutePosFromEnd,
            v[0][1],
            relativePos,
            otherNamedSet,
            otherNamedSetPos,
          );

          correspondingSets
            .forEach(set => {
              styleApplications[set] = stylingName;
            });
        }
      });

    return styleApplications
  }

  function processStyleRules(elements, styleDefinitions) {
    const ruleRegex = new RegExp(
      `^\\$(?:rule|r)\\(` +
      `(${namePattern})` +
      `(?:\\s*,\\s` +
      `(?:` + // second arg
      valueSetPattern +
      `)` +
      `)?` +
      `\\)$`
    );

    const styleRules = [];
    elements
      .flat()
      .map(v => [v, v[3].match(ruleRegex)])
      .filter(v => v[1])
      .forEach(v => {

        const [
          _,
          stylingName,
          valueSetName,
          valueSetSetIndex,
          valueSetSetStar,
          valueSetValueIndex,
          valueSetValueStar,
        ] = v[1];

        if (styleDefinitions.find(v => v.name === stylingName)) {

          const vssi = Number(valueSetSetIndex);
          const vsvi = Number(valueSetValueIndex);

          styleRules.push([
            stylingName,
            valueSetName === '*' ? star : valueSetName,
            valueSetSetIndex ? vssi : star,
            valueSetValueIndex ? vsvi : star,
          ]);
        }
      });

    return styleRules
  }

  function processCommands(elements, numberedSets, namedSets) {
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

    for (const elem of elements.flat()) {

      const [
        iterIndex,
        setIndex,
        elemIndex,
        theElem,
      ] = elem;

      const patternResult = theElem
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
          setIndex,
          elements.length,
          namedSets,
        );

        const toSetPosition = processPositionIndex(
          patternResult[15],
          patternResult[16],
          toSetNameWasDefined,
          toSetName[0] ? toSetName[0] : setIndex,
          numberedSets,
          elemIndex,
        );

        const [toSetNameNew, toSetPositionNew] = numberedSets
          .filter(v => toSetName.includes(v.name))
          .reduce((accu, sl) => {
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
          setIndex,
          elements.length,
          namedSets,
        );

        const fromSetPosition = processPositionIndex(
          patternResult[9],
          patternResult[10],
          true,
          setIndex,
          numberedSets,
          elemIndex,
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
    namedSets,
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
      const foundNs = namedSets
        .find(ns => ns.name === nameIndex);

      return foundNs
        ? [foundNs.sets, true]
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
        .reduce((accu, v) => {
          const elemIndex = v[2];

          return elemIndex < inSetIdx
            ? accu + 1
            : accu
        }, 0)
    }
  };

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

  function detectOrderDictator(orderConstraint, setReorders) {

    return orderConstraint
      .sets
      .map(v => ({
        name: v,
        length: setReorders.find(w => w.name === v).length
      }))
        .reduce((accu, v) => accu.length < v.length ? v : accu)
        .name
  }

  function reorderNumberedSets(numberedSets) {
    return numberedSets.map(v => ({
      iter: v.iter,
      name: v.name,
      length: v.elements.length,
      sets: [[v.iter, v.name]],
      setLengths: [v.elements.length],
      order: shuffle([...new Array(v.elements.length).keys()]),
      lastMinute: v.lastMinute,
    }))
  }

  function reorderNamedSets(namedSets, numberedSets) {
    return namedSets.map(v => {

      const containedNumberedSets = v.sets
        .map(v => numberedSets.filter(u => u.name === v));

      const setLengths = containedNumberedSets
        .map(v => v[0].elements.length);

      const elementCount = setLengths
        .reduce((accu, w) => accu + w, 0);

      return {
        iter: v.iter,
        name: v.name,
        length: elementCount,
        sets: v.sets.map(w => [v.iter, w]),
        setLengths: setLengths,
        order: shuffle([...new Array(elementCount).keys()]),
        lastMinute: v.lastMinute,
      }
    })
  }

  function applyOrderConstraint(orderConstraint, setReorders) {

    const dictator = detectOrderDictator(orderConstraint, setReorders);
    orderConstraint.dictator = dictator;

    const dictatorOrder = setReorders.find(v => v.name === orderConstraint.dictator).order;

    for (const set of orderConstraint.sets) {

      const oldOrder = setReorders.find(v => v.name === set).order;
      const newOrder = dictatorOrder.filter(v => v < oldOrder.length);

      // modifies setReorders
      setReorders.forEach(v => {
        if (v.name === set) {
          v.order = newOrder;
          if (orderConstraint.lastMinute) {
            v.lastMinute = true;
          }
        }
      });
    }

    return setReorders
  }

  function generateRandomization(
    numberedSets,
    namedSets,
  ) {
    const elements = numberedSets.map(v => v.elements);

    const setReorders = [
      reorderNumberedSets(numberedSets),
      reorderNamedSets(namedSets, numberedSets),
    ].flat();

    return [elements, setReorders]
  }

  function shareOrder(
    orderConstraints,
    setReorders,
  ) {
    // modifies setReorders (!)
    orderConstraints
      .forEach(orderConstraint => applyOrderConstraint(orderConstraint, setReorders));
  }

  function adjustForSecondRandomization(orderConstraints, numberedSets, namedSets) {

    const joinedSets = [numberedSets, namedSets].flat();

    for (const oc of orderConstraints.filter(v => v.lastMinute)) {
      for (const set of oc.sets) {
        joinedSets.find(v => v.name === set).lastMinute = true;
      }
    }
  }

  function matchStructures(elementsInherited, elementsOriginal) {
    const result = [];

    for (const setInherited of elementsInherited) {

      let match;
      if (match = elementsOriginal.find(set =>
        compareArrays(set.map(v => v[3]), setInherited.map(v => v[3]))
        // Don't make n-to-m mappings, only 1-to-1:
        && !result.find(v => v.to[0] === set[0][0] && v.to[1] === set[0][1])
      )) {

        console.log('lala', setInherited, match);

        // inherited set moved FROM position TO new position
        // used to be found at FROM position, but now is found at TO position
        result.push({
          from: setInherited[0].slice(0, 2),
          to: match[0].slice(0, 2),
        });

      }
    }

    return result
  }

  // modifies generatedValues by pushing rematches
  function matchGeneratedValues(structureMatches, generatedValuesInherited) {
    const result = [];

    for (const value of generatedValuesInherited) {
      const match = structureMatches.find(v => compareArrays(v.from.slice(0, 2), value.slice(0, 2)));

      if (match) {
        result.push([...match.to, value[2], value[3]]);
      }
    }
    return generatedValuesInherited.concat(result)
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

  function matchSetReorder(structureMatches, inheritedReorders, reorders) {
    const modifiedReorders = [];

    for (const reorder of reorders) {
      let match, reorderInherited;

      // named sets
      if ((typeof reorder.name === 'string') && (match = inheritedReorders.find(v => reorder.name === v.name))) {

        modifiedReorders.push({
          iter: reorder.iter,
          name: reorder.name,
          length: reorder.length,
          sets: reorder.sets,
          setLengths: reorder.setLengths,
          order: complementArrays(match.order, reorder.order),
          lastMinute: reorder.lastMinute,
        });
      }

      // numbered sets
      else if (
        (match = structureMatches.find(m => reorder.iter === m.to[0] && reorder.name === m.to[1])) &&
        (reorderInherited = inheritedReorders.find(reo => reo.iter === match.from[0] && reo.name === match.from[1]))
      ) {
        modifiedReorders.push({
          iter: reorder.iter,
          name: reorder.name,
          length: reorder.length,
          sets: reorder.sets,
          setLengths: reorder.setLengths,
          order: reorderInherited.order,
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

  // important for collective color indexing
  function reorderForRendering(structureMatches, reorderings, iterIndex) {

    const resultMatched = [];
    const resultNew = [];

    for (const [i, ro] of reorderings
      .map((v, j) => ({rendering: v, order: j}))
      .entries()
    ) {

      console.log('ro', ro);

      const match = structureMatches
        .find(v =>
          iterIndex === v.to[0] &&
          i === v.to[1]);

      if (match) {
        resultMatched.splice(match.from[1], 0, ro);
      }
      else {
        resultNew.push(ro);
      }
    }

    console.log('reo1', reorderings);
    console.log('reo2', resultMatched.filter(v => v).concat(resultNew));

    return resultMatched.filter(v => v).concat(resultNew)
  }

  function main(options, saveDataOld, frontside) {

    // frontside will be run with indices (-1, -2, -3, etc...)
    // backside will be run with indices (1, 2, 3, etc...)
    // but technically they are run in a row
    const saveDataAndSetsUsed = options
      .reduce((accu, v, iterIndex) => {
        const [
          saveDataNew,
          wereSetsUsed,
        ] = main2(
          frontside ? (-iterIndex - 1) : (iterIndex + 1),
          v.inputSyntax,
          v.defaultStyle,
          ...accu[0],
        );

        return [saveDataNew, wereSetsUsed || accu[1]]
      }, [
        saveDataOld,
        false /* no sets used is assumption */
      ]);

    return saveDataAndSetsUsed
  }

  //////////////////////////////////////////////////////////////////////////////
  // elementsInherited + elementsOriginal -> elementsFirst -> elementsSecond
  // [[0,0,'Hello','n'],[0,1,'World'],[]],[[],[]], etc.]

  // numberedSets -> numberedSetsSecond

  // reorders -> reordersSecond
  // [{name:1/name, length, sets, setLengths, order, lastMinute}]
  function main2(
    iterIndex,
    inputSyntax,
    defaultStyle,

    elementsInherited,
    generatedValuesInherited,
    uniquenessConstraintsInherited,
    reordersFirstInherited,
    reordersSecondInherited,
    randomIndicesInherited,
  ) {
    const form = formatter(inputSyntax, iterIndex);
    const elementsOriginal = form.getElementsOriginal();

    if (form.isValid && (!form.isContained) && elementsOriginal.length > 0) {

      const structureMatches = matchStructures(
        elementsInherited,
        elementsOriginal,
      );

      //////////////////////////////////////////////////////////////////////////////
      // FIRST RANDOMIZATION


      const [
        numberedSets,
        generatedValues,
        uniquenessConstraints,
        valueSets,
      ] = processNumberedSets(
        elementsOriginal,
        matchGeneratedValues(structureMatches, generatedValuesInherited),
        uniquenessConstraintsInherited,
        iterIndex,
      );

      const namedSets        = processNamedSets(elementsOriginal);
      const orderConstraints = processOrderConstraints(elementsOriginal, namedSets);

      // modifies numberedSets and namedSets
      adjustForSecondRandomization(orderConstraints, numberedSets, namedSets);

      const commands = processCommands(elementsOriginal, numberedSets, namedSets);

      const [
        styleDefinitions,
        styleApplications,
        styleRules,
      ] = processRenderDirectives(elementsOriginal, defaultStyle, namedSets);

      const [
        reordersFirst,
        elementsFirst,
      ] = applyModifications(
        numberedSets,
        namedSets,
        orderConstraints,
        commands,
        reordersFirstInherited,
        structureMatches,
      );

      //////////////////////////////////////////////////////////////////////////////
      // SECOND RANDOMIZATION
      const [numberedSetsSecond, _1, _2, _3] = processNumberedSets(
        elementsFirst.map(set => set.filter(elem => elem[4] !== 'd')),
        [],
        [],
        iterIndex,
        numberedSets.map(set => set.lastMinute),
      );

      const [
        reordersSecond,
        elementsSecond,
      ] = applyModifications(
        numberedSetsSecond,
        namedSets.filter(v => v.lastMinute),
        orderConstraints.filter(v => v.lastMinute),
        [],
        reordersSecondInherited,
        structureMatches,
        true,
      );

      //////////////////////////////////////////////////////////////////////////////
      // RENDERING
      const randomIndices = form.renderSets(
        reorderForRendering(structureMatches, elementsSecond, iterIndex),
        styleDefinitions,
        styleApplications,
        styleRules,
        randomIndicesInherited,
        valueSets,
        numberedSets,
      );

      //////////////////////////////////////////////////////////////////////////////
      return [[
        elementsInherited.concat(elementsOriginal.filter(v => !structureMatches.find(w => w.to[0] === v[0][0] && w.to[1] === v[0][1]))),
        generatedValues,
        uniquenessConstraints,
        reordersFirstInherited.concat(reordersFirst),
        reordersSecondInherited.concat(reordersSecond),
        randomIndices,
      ], true]
    }

    else {
      return [[
        elementsInherited,
        generatedValuesInherited,
        uniquenessConstraintsInherited,
        reordersFirstInherited,
        reordersSecondInherited,
        randomIndicesInherited,
      ], false]
    }
  }

  // numbered are sorted 0 -> n, then named are in order of appearance
  function applyModifications(numberedSets, namedSets, orderConstraints, commands, reordersInherited, structureMatches, lastMinute=false) {

    const [elements, reordersAlpha] = generateRandomization(numberedSets, namedSets);

    const reordersBeta = !lastMinute
      ? reordersAlpha
      : reordersAlpha.filter(v => v.lastMinute);

    const reorders = matchSetReorder(
      structureMatches,
      reordersInherited,
      reordersBeta,
    );

    // modifies reorders
    shareOrder(orderConstraints, reorders);

    // both modify elements
    applySetReorder(reorders, elements);
    applyCommands(commands, elements);

    return [
      reorders,
      elements,
    ]
  }

  front();

  function front() {
    const options = $$options;

    const [
      theSaveData,
      wereSetsUsed,
    ] = main(options, getNullData(), true);

    if (!window.Persistence) {
      createWarningNotDefined();
    }

    else if (!Persistence.isAvailable()) {
      createWarningNotAvailable(wereSetsUsed);
    }

    else {
      saveData(theSaveData);
    }
  }

}());
