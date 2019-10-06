$$options = [
  {
    inputSyntax: {
      cssSelector: 'div#set-randomizer-container',
      openDelim: '[[#',
      closeDelim: '#]]',
      fieldSeparator: ':::',
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
  {
    inputSyntax: {
      cssSelector: 'div#set-randomizer-container',
      openDelim: '[[',
      closeDelim: ']]',
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
