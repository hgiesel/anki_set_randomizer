import json
import os.path as path

from collections import namedtuple
from aqt import mw

from .utils import (
    safenav,
    safenav_preset,
)

from .config_types import (
    SRSetting,
    SRIteration, SRInjection,
    SRInputSyntax, SRDefaultStyle, SRValues,
    SRSourceMode, SRClozeOptions, SROcclusionOptions,
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

                    'stroke': it.default_style.stroke,
                    'strokeOpacity': it.default_style.stroke_opacity,
                    'strokeWidth': it.default_style.stroke_width,
                    'fill': it.default_style.fill,
                    'fillOpacity': it.default_style.fill_opacity,
                }
            } for it in s.iterations],
            'injections': [{
                'name': inj.name,
                'enabled': inj.enabled,
                'conditions': inj.conditions,
                'statements': inj.statements,
            } for inj in s.injections],
            'sourceMode': {
                'clozeOptions': {
                    'shortcutsEnabled': s.source_mode.cloze_options.shortcuts_enabled,
                    'vsPrefix': s.source_mode.cloze_options.vs_prefix,
                    'openDelim': s.source_mode.cloze_options.open_delim,
                    'closeDelim': s.source_mode.cloze_options.close_delim,
                },
                'occlusionOptions': {
                }
            }
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

                access_func([iteration], ['defaultStyle', 'stroke']),
                access_func([iteration], ['defaultStyle', 'strokeOpacity']),
                access_func([iteration], ['defaultStyle', 'strokeWidth']),
                access_func([iteration], ['defaultStyle', 'fill']),
                access_func([iteration], ['defaultStyle', 'fillOpacity']),
            ),
        ) for iteration in access_func([model_setting], ['iterations'])],
        [SRInjection(
            access_func([injection], ['name']),
            access_func([injection], ['enabled']),
            access_func([injection], ['conditions']),
            access_func([injection], ['statements']),
        ) for injection in access_func([model_setting], ['injections'])],
        SRSourceMode(
            SRClozeOptions(
                access_func([model_setting], ['sourceMode', 'clozeOptions', 'shortcutsEnabled']),
                access_func([model_setting], ['sourceMode', 'clozeOptions', 'vsPrefix']),
                access_func([model_setting], ['sourceMode', 'clozeOptions', 'openDelim']),
                access_func([model_setting], ['sourceMode', 'clozeOptions', 'closeDelim']),
            ),
            SROcclusionOptions(),
        )
    )

def deserialize_setting_with_default(model_name, settings):
    model_default = SETTINGS_DEFAULT

    found = filter(lambda v: v['modelName'] == model_name, settings)

    try:
        safe_get = safenav_preset([
            model_default,
            model_default['iterations'][0],
            model_default['injections'][0],
        ])
        model_deserialized = deserialize_setting(model_name, next(found), safe_get)

    except StopIteration as e:
        model_deserialized = SRSetting(
            model_name,
            model_default.enabled,
            model_default.insert_anki_persistence,
            model_default.paste_into_template,
            model_default.iterations,
            model_default.injections,
        )


    return model_deserialized

def get_settings(model_name=None):
    CONFIG = mw.addonManager.getConfig(__name__)

    if model_name:
        return deserialize_setting_with_default(model_name, safenav([CONFIG], ['settings'], default=None))

    else:
        model_settings = []

        for model in mw.col.models.models.values():
            model_name = (model['name'])
            model_deserialized = deserialize_setting_with_default(model_name, safenav([CONFIG], ['settings'], default=[]))
            model_settings.append(model_deserialized)

        return model_settings

# write config data to config.json
def write_settings(settings):
    mw.addonManager.writeConfig(__name__, {
        "settings": serialize_settings(settings)
    })

SCRIPTNAME = path.dirname(path.realpath(__file__))

# initialize default type
with open(path.join(SCRIPTNAME, '../../config.json'), encoding='utf-8') as config:
    config_default = json.load(config)

    SETTINGS_DEFAULT = config_default['settings'][0]
    SETTINGS_DEFAULT_DESERIALIZED = deserialize_setting('Default', SETTINGS_DEFAULT, safenav)
