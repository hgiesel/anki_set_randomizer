(function () {
  'use strict';

  function escapeString(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function formatter(options) {

    if (options) {
      if (window.Persistence && Persistence.isAvailable()) {
        Persistence.setItem("AnkiSetRandomizerOptions", options);
      }
    }

    else {
      if (window.Persistence && Persistence.isAvailable()) {
        options = Persistence.getItem("AnkiSetRandomizerOptions");
        Persistence.removeItem("AnkiSetRandomizerOptions");
      }
    }

    const getOriginalStructure = function() {
      const exprRegex = RegExp(`(?:${escapeString(options.inputSyntax.openDelim)})(.*?)(?:${escapeString(options.inputSyntax.closeDelim)})`, 'gm');
      const theBody = document.querySelector(options.query).innerHTML;

      const results = [];

      let m = exprRegex.exec(theBody);
      while (m) {
        results.push(m[1]);
        m = exprRegex.exec(theBody);
      }

      const splitResults = [];
      for (const [i, group] of results.entries()) {
        splitResults.push(group.split(options.inputSyntax.fieldSeparator).map((v, j) => [i, j, v]));
      }

      return splitResults
    };

    return {
      getOriginalStructure: getOriginalStructure,
    }
  }

  if (window.Persistence && Persistence.isAvailable()) {
    Persistence.removeItem("AnkiSetRandomizerOptions");
    // and everything else
  }

  const query = '%QUERY%';
  const colors = '%COLORS%';
  const fieldPadding = '%FIELDPADDING%';

  const inputSyntax = {
      openDelim: '%INPUTOPENDELIM%',
      closeDelim: '%INPUTCLOSEDELIM%',
      fieldSeparator: '%INPUTFIELDSEPARATOR%',
  };
  const outputSyntax = {
      openDelim: '%OUTPUTOPENDELIM%',
      closeDelim: '%OUTPUTCLOSEDELIM%',
      fieldSeparator: '%OUTPUTFIELDSEPARATOR%',
  };

  const form = formatter({
    query: ! query.startsWith('%') ? query : 'div#main',
    colors: ! colors[0].startsWith('%') ? colors : ['orange', 'olive', 'maroon', 'aqua', 'fuchsia', 'navy', 'lime'],
    fieldPadding: ! fieldPadding.startsWith('%') ? fieldPadding : '4px',

    inputSyntax: {
      openDelim: ! inputSyntax.openDelim.startsWith('%') ? inputSyntax.openDelim : '(^',
      closeDelim: ! inputSyntax.closeDelim.startsWith('%') ? inputSyntax.closeDelim : '^)',
      fieldSeparator: ! inputSyntax.fieldSeparator.startsWith('%') ? inputSyntax.fieldSeparator : '::',
    },
    outputSyntax: {
      openDelim: ! outputSyntax.openDelim.startsWith('%') ? outputSyntax.openDelim : '〔',
      closeDelim: ! outputSyntax.closeDelim.startsWith('%') ? outputSyntax.closeDelim : '〕',
      fieldSeparator: ! outputSyntax.fieldSeparator.startsWith('%') ? outputSyntax.fieldSeparator : '',
    }
  });

  try {
    const originalStructure = form.getOriginalStructure();
    console.log(originalStructure);
  }
  catch (e) {
    alert(`anki-set-randomizer: ${e}.`);
  }

  // processCommands(originalStructure)
  // sharedElements(originalStructure)
  // sharedOrders(originalStructure)

  // firstRoundRandomization

  // secondRoundRandomization

  // const multipleChoiceSettings = {
  //     query: query,
  //     colors: colors,
  //     fieldPadding: fieldPadding,
  //     inputSyntax: inputSyntax,
  //     outputSyntax: outputSyntax,
  // }

}());
