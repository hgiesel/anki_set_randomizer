from collections import namedtuple

from aqt import mw
from aqt.utils import showInfo

SetRandomizerSettings = namedtuple('SetRandomizerSettings', [
    'enabled',                       # bool

    'css_query',                     # str
    'css_query_auto_generate',       # bool

    'css_colors',                     # [str]
    'css_colors_collective_indexing', # bool
    'css_colors_random_start_index',  # bool

    'field_padding',                  # int

    'input_syntax_open_delim',       # str
    'input_syntax_close_delim',      # str
    'input_syntax_field_separator',  # str

    'output_syntax_open_delim',      # str
    'output_syntax_close_delim',     # str
    'output_syntax_field_separator', # str
    'output_syntax_empty_set',       # str

    'inject_anki_persistence',       # bool
])

def deserialize_configs(model_names, configs_settings_list):

    DEFAULT_SETTINGS = SetRandomizerSettings(
        False,
        'div#set-randomizer-container', True,
        ['orange', 'olive', 'maroon', 'aqua', 'fuchsia'], False, False,
        2,
        '[[', ']]', '::',
        '〔', '〕', ' ', '…',
        True,
    )

    DEFAULT_SETTINGS_CLOZE = SetRandomizerSettings(
        False,
        'div#set-randomizer-container', True,
        ['orange', 'olive', 'maroon', 'aqua', 'fuchsia'], False, False,
        2,
        '<<', '>>', ';;',
        '〔', '〕', ' ', '…',
        True,
    )

    DEFAULT_SETTINGS_CLOZE_OVERLAPPER = SetRandomizerSettings(
        False,
        'div#clozed', False,
        ['orange', 'olive', 'maroon', 'aqua', 'fuchsia'], False, False,
        2,
        '<<', '>>', ';;',
        '〔', '〕', ' ', '…',
        True,
    )

    model_configs = []

    for model_name in model_names:

        default_model = (DEFAULT_SETTINGS
                if not 'Cloze' in model_name
                else (DEFAULT_SETTINGS_CLOZE_OVERLAPPER
                    if model_name == 'Cloze (overlapping)'
                    else DEFAULT_SETTINGS_CLOZE))

        found = list(filter(
            lambda v: v['model_name'] == model_name,
            configs_settings_list,
        ))

        if found:
            theFound = found[0]['settings']

            def safe_get(key, key2=None):
                if key2:
                    return (theFound[key][key2]
                            if key in theFound and key2 in theFound[key]
                            else getattr(getattr(default_model, key), key2)
                            )
                else:
                    return (theFound[key]
                            if key in theFound
                            else getattr(default_model, key)
                            )

            model_configs.append({
                "name": model_name,
                "settings": SetRandomizerSettings(
                    safe_get('enabled'),

                    safe_get('css_query'),
                    safe_get('css_query_auto_generate'),

                    safe_get('css_colors'),
                    safe_get('css_colors_collective_indexing'),
                    safe_get('css_colors_random_start_index'),

                    safe_get('field_padding'),

                    safe_get('input_syntax', 'open_delim'),
                    safe_get('input_syntax', 'close_delim'),
                    safe_get('input_syntax', 'field_separator'),
                    safe_get('output_syntax', 'open_delim'),
                    safe_get('output_syntax', 'close_delim'),
                    safe_get('output_syntax', 'field_separator'),
                    safe_get('output_syntax', 'empty_set'),

                    safe_get('inject_anki_persistence'),
                )
            })

        else:

            model_configs.append({
                "name": model_name,
                "settings": default_model
            })

    return model_configs

def serialize_configs(configs_data):
    settings_list = []

    for elem in configs_data:
        name = elem['name']
        settings = elem['settings']

        settings_list.append({
            'model_name': name,
            'settings': {
                'enabled': settings.enabled,
                'css_query': settings.css_query,
                'css_query_auto_generate': settings.css_query_auto_generate,
                'css_colors': settings.css_colors,
                'css_colors_collective_indexing': settings.css_colors_collective_indexing,
                'css_colors_random_start_index': settings.css_colors_random_start_index,
                'field_padding': settings.field_padding,
                'input_syntax': {
                    'open_delim': settings.input_syntax_open_delim,
                    'close_delim': settings.input_syntax_close_delim,
                    'field_separator': settings.input_syntax_field_separator,
                },
                'output_syntax': {
                    'open_delim': settings.output_syntax_open_delim,
                    'close_delim': settings.output_syntax_close_delim,
                    'field_separator': settings.output_syntax_field_separator,
                    'empty_set': settings.output_syntax_empty_set,
                },
                'inject_anki_persistence': settings.inject_anki_persistence,
            }
        })

    result = {'settings_list': settings_list}
    return result


def get_configs_data():
    CONFIG = mw.addonManager.getConfig(__name__)

    model_names = []
    for model in mw.col.models.models.values():
        model_names.append(model['name'])

    return deserialize_configs(model_names, CONFIG['settings_list'])

def write_configs_data(configs_data):
    mw.addonManager.writeConfig(__name__, serialize_configs(configs_data))
