from collections import namedtuple

SRSetting = namedtuple('SRSetting', [
    'model_name',              # string
    'description',             # string
    'enabled',                 # bool
    'insert_anki_persistence', # bool
    'paste_into_template',     # bool
    'iterations',              # list of SRIterations
    'injections',              # list of SRInjections
    'source_mode',             # SRSourceMode
])

SRInjection = namedtuple('SRInjection', [
    'name',        # string
    'description', # string
    'enabled',     # bool
    'conditions',  # condition structure
    'statements',  # array of strings
])

SRIteration = namedtuple('SRIteration', [
    'name',          # string
    'description',   # string
    'enabled',       # bool
    'input_syntax',  # SRInputSyntax
    'default_style', # SRDefaultStyle
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

    'stroke',          # str
    'stroke_opacity',  # number
    'stroke_width',    # number
    'fill',            # str
    'fill_opacity',    # number
])

SRSourceMode = namedtuple('SRSourceMode', [
    'cloze_options',        # SRCloze
    'occlusion_options',    # SRCloze
])

SRClozeOptions = namedtuple('SRClozeOptions', [
    'shortcuts_enabled',  # bool
    'vs_prefix',         # str
    'open_delim',        # str
    'close_delim',       # str
])

SROcclusionOptions = namedtuple('SROcclusionOptions', [
])

SRValues = namedtuple('SRValues', [
    'values',              # list
    'delim',               # string
    'random_start_index',  # boolean
    'collective_indexing', # boolean
])
