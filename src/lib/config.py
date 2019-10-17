import json
import os.path as path

from collections import namedtuple
from aqt import mw
from aqt.utils import showInfo

from .utils import (
    safenav,
    safenav_preset,
)

from .config_types import (
    SRSetting,
    SRIteration, SRInjection,
    SRInputSyntax, SRDefaultStyle, SRValues,
    INPUT_SYNTAX_CLOZE, INPUT_SYNTAX_CLOZE_OL,
)

def serialize_settings(settings):
    settings_serialized = []

    for s in settings:

        settings_serialized.append({
            'modelName': s.model_name,
            'enabled': s.enabled,
            'insertAnkiPersistence': s.insert_anki_persistence,
            'pasteIntoTemplate': s.paste_into_template,
            'iterations': [{
                'name': it.name,
                'enabled': it.enabled,
                'inputSyntax': {
                    'cssSelector': it.input_syntax.css_selector,
                    'openDelim': it.input_syntax.open_delim,
                    'closeDelim': it.input_syntax.close_delim,
                    'fieldSeparator': it.input_syntax.field_separator,
                    'isRegex': it.input_syntax.is_regex,
                },
                'defaultStyle': {
                    'colors': {
                        'values': it.default_style.colors.values,
                        'randomStartIndex': it.default_style.colors.random_start_index,
                        'collectiveIndexing': it.default_style.colors.collective_indexing,
                    },
                    'classes': {
                        'values': it.default_style.classes.values,
                        'randomStartIndex': it.default_style.classes.random_start_index,
                        'collectiveIndexing': it.default_style.classes.collective_indexing,
                    },
                    'fieldPadding': it.default_style.field_padding,
                    'fieldSeparator': it.default_style.field_separator,
                    'openDelim': it.default_style.open_delim,
                    'closeDelim': it.default_style.close_delim,
                    'emptySet': it.default_style.empty_set,
                }
            } for it in s.iterations],
            'injections': [{
                'name': inj.name,
                'enabled': inj.enabled,
                'conditions': inj.conditions,
                'statements': inj.statements,
            } for inj in s.injections],
        })

    return settings_serialized

def deserialize_setting(model_name, model_setting, access_func):

    return SRSetting(
        model_name,
        access_func([model_setting], ['enabled']),
        access_func([model_setting], ['insertAnkiPersistence']),
        access_func([model_setting], ['pasteIntoTemplate']),
        [SRIteration(
            access_func([iteration], ['name']),
            access_func([iteration], ['enabled']),
            SRInputSyntax(
                access_func([iteration], ['inputSyntax', 'cssSelector']),
                access_func([iteration], ['inputSyntax', 'openDelim']),
                access_func([iteration], ['inputSyntax', 'closeDelim']),
                access_func([iteration], ['inputSyntax', 'fieldSeparator']),
                access_func([iteration], ['inputSyntax', 'isRegex']),
            ),
            SRDefaultStyle(
                SRValues(
                    access_func([iteration], ['defaultStyle', 'colors', 'values']),
                    access_func([iteration], ['defaultStyle', 'colors', 'randomStartIndex']),
                    access_func([iteration], ['defaultStyle', 'colors', 'collectiveIndexing']),
                ),
                SRValues(
                    access_func([iteration], ['defaultStyle', 'classes', 'values']),
                    access_func([iteration], ['defaultStyle', 'classes', 'randomStartIndex']),
                    access_func([iteration], ['defaultStyle', 'classes', 'collectiveIndexing']),
                ),
                access_func([iteration], ['defaultStyle', 'fieldPadding']),
                access_func([iteration], ['defaultStyle', 'fieldSeparator']),
                access_func([iteration], ['defaultStyle', 'openDelim']),
                access_func([iteration], ['defaultStyle', 'closeDelim']),
                access_func([iteration], ['defaultStyle', 'emptySet']),
            ),
        ) for iteration in access_func([model_setting], ['iterations'])],
        [SRInjection(
            access_func([injection], ['name']),
            access_func([injection], ['enabled']),
            access_func([injection], ['conditions']),
            access_func([injection], ['statements']),
        ) for injection in access_func([model_setting], ['injections'])],
    )

def deserialize_settings_with_default(model_names, settings):
    model_settings = []

    from aqt.utils import showInfo

    for model_name in model_names:

        found = filter(lambda v: v['modelName'] == model_name, settings)

        model_default = (
            SETTINGS_CLOZE_OL
            if 'Cloze (overlapping)' in model_name
            else (SETTINGS_CLOZE
                  if 'Cloze' in model_name
                  else SETTINGS_DEFAULT)
        )

        try:
            safe_get = safenav_preset([model_default])

            model_settings.append(
                deserialize_setting(model_name, next(found), safe_get)
            )

        except StopIteration as e:

            model_settings.append(
                SRSetting(
                    model_name,
                    model_default.enabled,
                    model_default.insert_anki_persistence,
                    model_default.paste_into_template,
                    model_default.iterations,
                    model_default.injections,
                )
            )

    return model_settings

def get_settings():
    CONFIG = mw.addonManager.getConfig(__name__)

    model_names = []
    for model in mw.col.models.models.values():
        model_names.append(model['name'])

    return deserialize_settings_with_default(model_names, safenav([CONFIG], ['settings'], default=[]))

# write config data to config.json
def write_settings(settings):
    mw.addonManager.writeConfig(__name__, {
        "settings": serialize_settings(settings)
    })

SCRIPTNAME = path.dirname(path.realpath(__file__))

# initialize default type
with open(path.join(SCRIPTNAME, '../../config.json'), encoding='utf-8') as config:

    settings = json.load(config)['settings']

    SETTINGS_DEFAULT = deserialize_setting(
        'Default',
        settings[0],
        safenav,
    )

    SETTINGS_CLOZE = deserialize_setting(
        'Cloze',
        settings[1],
        safenav,
    )

    SETTINGS_CLOZE_OL = deserialize_setting(
        'Cloze (overlapping)',
        settings[2],
        safenav,
    )
