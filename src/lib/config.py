from collections import namedtuple

from aqt import mw
from aqt.utils import showInfo

SetRandomizerSettings = namedtuple('SetRandomizerSettings', [
    'enabled',                      # bool
    'css_query',                    # str
    'css_query_auto_generate',      # bool
    'css_colors',                   # [str]
    'field_padding',                # int

    'input_syntax_open_delim',       # str
    'input_syntax_close_delim',      # str
    'input_syntax_field_separator',  # str
    'output_syntax_open_delim',      # str
    'output_syntax_close_delim',     # str
    'output_syntax_field_separator', # str

    'inject_anki_persistence',       # bool
])

def deserialize_configs(model_names, configs_settings_list):

    DEFAULT_SETTINGS = SetRandomizerSettings(
        False,
        'div#set-randomizer-container',
        True,
        ['orange', 'olive', 'maroon', 'aqua', 'fuchsia'],
        4,
        '(^', '^)', '::',
        '〔', '〕', '',
        True,
    )

    model_configs = []

    for model_name in model_names:

        found = list(filter(
            lambda v: v['model_name'] == model_name,
            configs_settings_list,
        ))

        if found:
            theFound = found[0]['settings']
            model_configs.append({
                "name": model_name,
                "settings": SetRandomizerSettings(
                    theFound['enabled'],
                    theFound['css_query'],
                    theFound['css_query_auto_generate'],
                    theFound['css_colors'],
                    theFound['field_padding'],

                    theFound['input_syntax']['open_delim'],
                    theFound['input_syntax']['close_delim'],
                    theFound['input_syntax']['field_separator'],
                    theFound['output_syntax']['open_delim'],
                    theFound['output_syntax']['close_delim'],
                    theFound['output_syntax']['field_separator'],

                    theFound['inject_anki_persistence'],
                )
            })

        else:
            model_configs.append({
                "name": model_name,
                "settings": DEFAULT_SETTINGS
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
