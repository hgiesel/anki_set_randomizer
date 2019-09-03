import json
import os.path as path

from collections import namedtuple
from aqt import mw
from aqt.utils import showInfo

def serialize_config(settings):
    settings_serialized = []

    for s in settings:

        settings_serialized.append({
            'modelName': s.model_name,
            'enabled': s.enabled,
            'injectAnkiPersistence': s.inject_anki_persistence,
            'pasteIntoTemplate': s.paste_into_template,
            'options': [{
                'inputSyntax': {
                    'cssSelector': opt.input_syntax.css_selector,
                    'openDelim': opt.input_syntax.open_delim,
                    'closeDelim': opt.input_syntax.close_delim,
                    'fieldSeparator': opt.input_syntax.field_separator,
                    'isRegex': opt.input_syntax.is_regex,
                    },
                'defaultStyle': {
                    'colors': {
                        'values': opt.default_style.colors.values,
                        'randomStartIndex': opt.default_style.colors.random_start_index,
                        'collectiveIndexing': opt.default_style.colors.collective_indexing,
                    },
                    'classes': {
                        'values': opt.default_style.classes.values,
                        'randomStartIndex': opt.default_style.classes.random_start_index,
                        'collectiveIndexing': opt.default_style.classes.collective_indexing,
                    },
                    'fieldPadding': opt.default_style.field_padding,
                    'fieldSeparator': opt.default_style.field_separator,
                    'openDelim': opt.default_style.open_delim,
                    'closeDelim': opt.default_style.close_delim,
                    'emptySet': opt.default_style.empty_set,
                    }
                } for opt in s.options]
            })

    return {'settings': settings_serialized}

def deserialize_config(model_name, model_setting, access_func):

    return SRSetting(
        model_name,
        access_func(model_setting, 'enabled'),
        access_func(model_setting, 'injectAnkiPersistence'),
        access_func(model_setting, 'pasteIntoTemplate'),
        [SROption(
            SRInputSyntax(
                access_func(option, 'inputSyntax', 'cssSelector'),
                access_func(option, 'inputSyntax', 'openDelim'),
                access_func(option, 'inputSyntax', 'closeDelim'),
                access_func(option, 'inputSyntax', 'fieldSeparator'),
                access_func(option, 'inputSyntax', 'isRegex'),
            ),
            SRDefaultStyle(
                SRValues(
                    access_func(option, 'defaultStyle', 'colors', 'values'),
                    access_func(option, 'defaultStyle', 'colors', 'randomStartIndex'),
                    access_func(option, 'defaultStyle', 'colors', 'collectiveIndexing'),
                ),
                SRValues(
                    access_func(option, 'defaultStyle', 'classes', 'values'),
                    access_func(option, 'defaultStyle', 'classes', 'randomStartIndex'),
                    access_func(option, 'defaultStyle', 'classes', 'collectiveIndexing'),
                ),
                access_func(option, 'defaultStyle', 'fieldPadding'),
                access_func(option, 'defaultStyle', 'fieldSeparator'),
                access_func(option, 'defaultStyle', 'openDelim'),
                access_func(option, 'defaultStyle', 'closeDelim'),
                access_func(option, 'defaultStyle', 'emptySet'),
            ),
        ) for option in access_func(model_setting, 'options')]
    )

def deserialize_config_with_default(model_names, config):
    model_settings = []

    for model_name in model_names:

        found = list(filter(
            lambda v: v['modelName'] == model_name,
            config,
        ))

        model_default = (
            SETTINGS_CLOZE_OL
            if 'Cloze (overlapping)' in model_name
            else (SETTINGS_CLOZE
                  if 'Cloze' in model_name
                  else SETTINGS_DEFAULT)
        )

        if found:
            the_found = found[0]

            def safe_get(elem, key, key2=None, key3=None):
                if key3:
                    return (elem[key][key2][key3]
                            if key in elem and key2 in elem[key] and key3 in elem[key][key2]
                            else getattr(getattr(getattr(model_default, key), key2), key3))
                elif key2:
                    return (elem[key][key2]
                            if key in elem and key2 in elem[key]
                            else getattr(getattr(model_default, key), key2))
                else:
                    return (elem[key]
                            if key in elem
                            else getattr(model_default, key))

            model_settings.append(
                deserialize_config(model_name, the_found, safe_get)
            )

        else:
            model_settings.append(
                SRSetting(
                    model_name,
                    model_default.enabled,
                    model_default.inject_anki_persistence,
                    model_default.paste_into_template,
                    model_default.options,
                )
            )

    return model_settings

def get_config_data():
    CONFIG = mw.addonManager.getConfig(__name__)

    model_names = []
    for model in mw.col.models.models.values():
        model_names.append(model['name'])


    if CONFIG and CONFIG['settings']:
        return deserialize_config_with_default(model_names, CONFIG['settings'])
    else:
        return deserialize_config_with_default(model_names, [])

# write config to config.json
def write_config_data(config_data):
    mw.addonManager.writeConfig(__name__, serialize_config(config_data))

SRSetting = namedtuple('SRSetting', [
    'model_name',
    'enabled',                 # bool
    'inject_anki_persistence', # bool
    'paste_into_template',     # bool
    'options',                 # list of SROption
])

SROption = namedtuple('SROption', [
    'input_syntax',
    'default_style',
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

SCRIPTNAME = path.dirname(path.realpath(__file__))

# initialize default type
with open(path.join(SCRIPTNAME, '../../config.json'), encoding='utf-8') as config:

    def access_func(elem, key1, key2=None, key3=None):
        return (elem[key1][key2][key3]
                if key3
                else (elem[key1][key2]
                      if key2
                      else (elem[key1])))

    settings = json.load(config)['settings']

    SETTINGS_DEFAULT = deserialize_config(
        'Default',
        settings[0],
        access_func,
    )

    SETTINGS_CLOZE = deserialize_config(
        'Cloze',
        settings[1],
        access_func,
    )

    SETTINGS_CLOZE_OL = deserialize_config(
        'Cloze (overlapping)',
        settings[2],
        access_func,
    )
