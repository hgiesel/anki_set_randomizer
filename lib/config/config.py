import os
import io
from collections import namedtuple

from aqt import mw
from aqt.utils import showInfo

def setupModels(name, config):
    dir_path = os.path.dirname(os.path.realpath(__file__))

    with io.open(f'{dir_path}/../res/front-web.html', mode='r', encoding='utf-8') as front_temp:
        with io.open(f'{dir_path}/../res/back-web.html', mode='r', encoding='utf-8') as back_temp:

            showInfo(front_temp.read())

            model_names = []
            for model in mw.col.models.models.values():
                model_names.append(model['name'])

            for model_name in model_names:
                themodel = mw.col.models.byName(model_name)

                for template in themodel['tmpls']:
                    showInfo(template['qfmt'])
                    template['afmt']

def getConfigs(config):

    model_names = []
    for model in mw.col.models.models.values():
        model_names.append(model['name'])

    map(lambda n: filter(lambda x: x['name']config(n), model_names)

    return name, config


MultipleChoiceSettings = namedtuple('MultipleChoiceSettings', [
    'css_query', # str
    'css_query_auto_generate', # bool
    'css_colors', # [str]
    'field_padding', # int
    'syntax_open_delim', # str
    'syntax_close_delim', # str
    'syntax_field_separator', # str
    'output_open_delim', # str
    'output_close_delim', # str
    'output_field_separator', # str
])

DEFAULT_SETTINGS = MultipleChoiceSettings(
    'div#thecard',
    True,
    ['orange', 'olive', 'maroon', 'aqua', 'fuchsia'],
    4,
    '(^', '^)', '::',
    '〔', '〕', '',
)

CONFIG = mw.addonManager.getConfig(__name__)
