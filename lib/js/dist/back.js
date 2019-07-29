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

  if (window.Persistence && Persistence.isAvailable() && Persistence.getItem("AnkiSetRandomizerOptions")) {
    const options = Persistence.getItem("AnkiSetRandomizerOptions");
    console.log(options);

    const form = formatter();
    console.log(form.getOriginalStructure());

    // console.log(sortByIndices(['a', 'b', 'c'], [2,1,0]))
  }

}());
