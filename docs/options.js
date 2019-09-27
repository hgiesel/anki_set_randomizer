$$options = [
  {
    inputSyntax: {
      cssSelector: '.example',
      openDelim: '{{',
      closeDelim: '}}',
      fieldSeparator: '::',
      isRegex: false,
    },

    defaultStyle: {
      openDelim: '\u3014',
      closeDelim: '\u3015',
      emptySet: '…',

      fieldPadding: 2,
      fieldSeparator: ' ',

      colors: {
        values: ['lightgreen', 'green', 'darkgreen'],
        collectiveIndexing: true,
        randomStartIndex: false,
      },

      classes: {
        values: [],
        collectiveIndexing: true,
        randomStartIndex: false,
      }
    },
  },
]
