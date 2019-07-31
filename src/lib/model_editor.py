import os
import io
import re
import json

from aqt import mw
from aqt.utils import showInfo
from string import Template

from . import util

class BetterTemplate(Template):
    delimiter = '$$'

def setup_models(config):
    for entry in config:
        model = mw.col.models.byName(entry['name'])

        remove_model_template(model)

        if entry['settings'].enabled:
            update_model_template(model, entry['settings'])

def remove_model_template(model):

    # re.sub('\nThis.*?ok', '', template[, flags=re.MULTILINE)))
    for template in model['tmpls']:
        template['qfmt'] = re.sub(
            '^<script>\n// SET RANDOMIZER FRONT TEMPLATE .*</script>',
            '',
            template['qfmt'],
            flags=re.MULTILINE | re.DOTALL,
        )

        template['afmt'] = re.sub(
            '^<script>\n// SET RANDOMIZER BACK TEMPLATE .*</script>',
            '',
            template['afmt'],
            flags=re.MULTILINE | re.DOTALL,
        )

        for side in ['qfmt', 'afmt']:
            template[side] = re.sub(
                '^.*<!-- CREATED BY SET RANDOMIZER -->$',
                '',
                template[side],
            )

def update_model_template(model, settings):
    dir_path = os.path.dirname(os.path.realpath(__file__))

    with io.open(f'{dir_path}/../js/dist/front.js', mode='r', encoding='utf-8') as template_front:
        js_front = BetterTemplate(template_front.read()).substitute(
            query= f'"{settings.css_query}"' if not settings.css_query_auto_generate else '"div#set-randomizer-container"',
            colors=f'"{repr(settings.css_colors)}"',
            field_padding=f'"{settings.field_padding}px"',
            input_syntax_open_delim=f'{json.dumps(settings.input_syntax_open_delim)}',
            input_syntax_close_delim=f'{json.dumps(settings.input_syntax_close_delim)}',
            input_syntax_field_separator=f'{json.dumps(settings.input_syntax_field_separator)}',
            output_syntax_open_delim=f'{json.dumps(settings.output_syntax_open_delim)}',
            output_syntax_close_delim=f'{json.dumps(settings.output_syntax_close_delim)}',
            output_syntax_field_separator=f'{json.dumps(settings.output_syntax_field_separator)}',
        )

        showInfo(repr(js_front))

    with io.open(f'{dir_path}/../js/dist/back.js', mode='r', encoding='utf-8') as template_back:
        js_back = template_back.read()
        showInfo(repr(js_back))

    for template in model['tmpls']:
        template['qfmt'] = f'{template["qfmt"]}\n<script>\n// SET RANDOMIZER FRONT TEMPLATE {util.versionString}\n{js_front}</script>'
        template['afmt'] = f'{template["afmt"]}\n<script>\n// SET RANDOMIZER FRONT TEMPLATE {util.versionString}\n{js_back}</script>'
