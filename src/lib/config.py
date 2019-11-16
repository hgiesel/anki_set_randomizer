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

SCRIPTNAME = path.dirname(path.realpath(__file__))

# initialize default type
with open(path.join(SCRIPTNAME, '../../config.json'), encoding='utf-8') as config:
    config_default = json.load(config)

    SETTINGS_DEFAULT = config_default['settings'][0]
    model_default = SETTINGS_DEFAULT

    safenav_setting = safenav_preset([model_default])
    safenav_iteration = safenav_preset([model_default['iterations'][0]])
    safenav_injection = safenav_preset([model_default['injections'][0]])
    safenav_input_syntax = safenav_preset([model_default['iterations'][0]['inputSyntax']])
    safenav_default_style = safenav_preset([model_default['iterations'][0]['defaultStyle']])
    safenav_values = safenav_preset([model_default['iterations'][0]['defaultStyle']['colors']])
    safenav_source_mode = safenav_preset([model_default['sourceMode']])
    safenav_cloze_options = safenav_preset([model_default['sourceMode']['clozeOptions']])
    safenav_occlusion_options = safenav_preset([model_default['sourceMode']['occlusionOptions']])

def serialize_setting(setting) -> dict:
    return {
        'modelName': setting.model_name,
        'description': setting.description,
        'enabled': setting.enabled,
        'insertAnkiPersistence': setting.insert_anki_persistence,
        'pasteIntoTemplate': setting.paste_into_template,
        'iterations': [{
            'name': it.name,
            'description': it.description,
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
                    'delim': it.default_style.colors.delim,
                    'randomStartIndex': it.default_style.colors.random_start_index,
                    'collectiveIndexing': it.default_style.colors.collective_indexing,
                },
                'classes': {
                    'values': it.default_style.classes.values,
                    'delim': it.default_style.classes.delim,
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
        } for it in setting.iterations],
        'injections': [{
            'name': inj.name,
            'description': inj.description,
            'enabled': inj.enabled,
            'conditions': inj.conditions,
            'statements': inj.statements,
        } for inj in setting.injections],
        'sourceMode': {
            'clozeOptions': {
                'shortcutsEnabled': setting.source_mode.cloze_options.shortcuts_enabled,
                'vsPrefix': setting.source_mode.cloze_options.vs_prefix,
                'openDelim': setting.source_mode.cloze_options.open_delim,
                'closeDelim': setting.source_mode.cloze_options.close_delim,
            },
            'occlusionOptions': {
            }
        }
    }

def deserialize_input_syntax(input_syntax_data, access_func = safenav_input_syntax) -> SRInputSyntax:
    return input_syntax_data if type(input_syntax_data) == SRInputSyntax else SRInputSyntax(
        access_func([input_syntax_data], ['cssSelector']),
        access_func([input_syntax_data], ['openDelim']),
        access_func([input_syntax_data], ['closeDelim']),
        access_func([input_syntax_data], ['fieldSeparator']),
        access_func([input_syntax_data], ['isRegex']),
    )

def deserialize_values(values_data, access_func = safenav_values) -> SRValues:
    return values_data if type(values_data) == SRValues else SRValues(
        access_func([values_data], ['values']),
        access_func([values_data], ['delim']),
        access_func([values_data], ['randomStartIndex']),
        access_func([values_data], ['collectiveIndexing']),
    )

def deserialize_default_style(default_style_data, access_func = safenav_default_style) -> SRDefaultStyle:
    return default_style_data if type(default_style_data) == SRDefaultStyle else SRDefaultStyle(
        deserialize_values(access_func([default_style_data], ['colors'])),
        deserialize_values(access_func([default_style_data], ['classes'])),
        access_func([default_style_data], ['fieldPadding']),
        access_func([default_style_data], ['fieldSeparator']),
        access_func([default_style_data], ['openDelim']),
        access_func([default_style_data], ['closeDelim']),
        access_func([default_style_data], ['emptySet']),

        access_func([default_style_data], ['stroke']),
        access_func([default_style_data], ['strokeOpacity']),
        access_func([default_style_data], ['strokeWidth']),
        access_func([default_style_data], ['fill']),
        access_func([default_style_data], ['fillOpacity']),
    )

def deserialize_iteration(iteration_data, access_func = safenav_iteration) -> SRIteration:
    return iteration_data if type(iteration_data) == SRIteration else SRIteration(
        access_func([iteration_data], ['name']),
        access_func([iteration_data], ['description']),
        access_func([iteration_data], ['enabled']),
        deserialize_input_syntax(access_func([iteration_data], ['inputSyntax'])),
        deserialize_default_style(access_func([iteration_data], ['defaultStyle'])),
    )

def deserialize_injection(injection_data, access_func = safenav_injection) -> SRInjection:
    return injection_data if type(injection_data) == SRInjection else SRInjection(
        access_func([injection_data], ['name']),
        access_func([injection_data], ['description']),
        access_func([injection_data], ['enabled']),
        access_func([injection_data], ['conditions']),
        access_func([injection_data], ['statements']),
    )

def deserialize_occlusion_options(occlusion_data, access_func = safenav_occlusion_options) -> SROcclusionOptions:
    return occlusion_data if type(occlusion_data) == SROcclusionOptions else SROcclusionOptions()

def deserialize_cloze_options(cloze_data, access_func = safenav_cloze_options) -> SRClozeOptions:
    return cloze_data if type(cloze_data) == SRClozeOptions else SRClozeOptions(
        access_func([cloze_data], ['shortcutsEnabled']),
        access_func([cloze_data], ['vsPrefix']),
        access_func([cloze_data], ['openDelim']),
        access_func([cloze_data], ['closeDelim']),
    )

def deserialize_source_mode(source_mode_data, access_func = safenav_source_mode) -> SRSourceMode:
    return source_mode_data if type(source_mode_data) == SRSourceMode else SRSourceMode(
        deserialize_cloze_options(access_func([source_mode_data], ['clozeOptions'])),
        deserialize_occlusion_options(access_func([source_mode_data], ['occlusionOptions'])),
    )

def deserialize_setting(model_name, model_setting, access_func = safenav_setting) -> SRSetting:
    return model_setting if type(model_setting) == SRSetting else SRSetting(
        model_name,
        access_func([model_setting], ['description']),
        access_func([model_setting], ['enabled']),
        access_func([model_setting], ['insertAnkiPersistence']),
        access_func([model_setting], ['pasteIntoTemplate']),
        [deserialize_iteration(iter) for iter in access_func([model_setting], ['iterations'])],
        [deserialize_injection(inj) for inj in access_func([model_setting], ['injections'])],
        deserialize_source_mode(access_func([model_setting], ['sourceMode'])),
    )

def deserialize_setting_with_default(model_name, settings):
    found = filter(lambda v: v['modelName'] == model_name, settings)

    try:
        model_deserialized = deserialize_setting(model_name, next(found))

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
        "settings": [serialize_setting(setting) for setting in settings],
    })
