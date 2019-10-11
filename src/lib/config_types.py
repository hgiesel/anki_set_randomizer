from collections import namedtuple

SRSetting = namedtuple('SRSetting', [
    'model_name',
    'enabled',                 # bool
    'insert_anki_persistence', # bool
    'paste_into_template',     # bool
    'iterations',              # list of SRIterations
    'injections',              # list of SRInjections
])

SRIteration = namedtuple('SRIteration', [
    'enabled',       # bool
    'input_syntax',
    'default_style',
])

SRInjection = namedtuple('SRInjection', [
    'enabled', # bool
    'name',
    'conditions', # condition structure
    'statements', # array of strings
])

SRInputSyntax = namedtuple('SRInputSyntax', [
    'css_selector',    # str
    'open_delim',      # str
    'close_delim',     # str
    'field_separator', # str
    'is_regex',        # bool
])

SRDefaultStyle = namedtuple('SRDefaultStyle', [
    'colors',   # SRValues
    'classes',  # SRValues
    'field_padding',     # number
    'field_separator',     # str
    'open_delim',          # str
    'close_delim',         # str
    'empty_set',           # str
])

SRValues = namedtuple('SRValues', [
    'values',              # list
    'random_start_index',  # boolean
    'collective_indexing', # boolean
])

INPUT_SYNTAX_CLOZE    = SRInputSyntax('div#qa', '<<', '>>', ';;', False)
INPUT_SYNTAX_CLOZE_OL = SRInputSyntax('div#clozed', '<<', '>>', ';;', False)
