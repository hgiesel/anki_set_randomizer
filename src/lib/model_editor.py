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

    for template in model['tmpls']:

        for side in ['qfmt', 'afmt']:
            template[side] = re.sub(
                '^[^\n]*SET RANDOMIZER AUTOGEN DIV[^\n]*$\n',
                '',
                template[side],
                flags=re.MULTILINE,
            )

        template['qfmt'] = re.sub(
            '\n?<script>\n// SET RANDOMIZER FRONT TEMPLATE .*</script>',
            '',
            template['qfmt'],
            flags=re.MULTILINE | re.DOTALL,
        ).strip()

        template['afmt'] = re.sub(
            '\n?<script>\n// SET RANDOMIZER BACK TEMPLATE .*</script>',
            '',
            template['afmt'],
            flags=re.MULTILINE | re.DOTALL,
        ).strip()


def update_model_template(model, settings):
    dir_path = os.path.dirname(os.path.realpath(__file__))

    with io.open(f'{dir_path}/../js/dist/front.js', mode='r', encoding='utf-8') as template_front:
        js_front = BetterTemplate(template_front.read()).substitute(
            query=json.dumps(settings.css_query) if not settings.css_query_auto_generate else json.dumps("div#set-randomizer-container"),
            colors=json.dumps(settings.css_colors),
            colors_collective_indexing=json.dumps(settings.css_colors_collective_indexing),
            colors_random_start_index=json.dumps(settings.css_colors_random_start_index),
            field_padding=json.dumps(settings.field_padding),
            input_syntax_open_delim=json.dumps(settings.input_syntax_open_delim),
            input_syntax_close_delim=json.dumps(settings.input_syntax_close_delim),
            input_syntax_field_separator=json.dumps(settings.input_syntax_field_separator),
            output_syntax_open_delim=json.dumps(settings.output_syntax_open_delim),
            output_syntax_close_delim=json.dumps(settings.output_syntax_close_delim),
            output_syntax_field_separator=json.dumps(settings.output_syntax_field_separator),
            output_syntax_empty_set=json.dumps(settings.output_syntax_empty_set),
        )

    with io.open(f'{dir_path}/../js/dist/back.js', mode='r', encoding='utf-8') as template_back:
        js_back = template_back.read()

    with io.open(f'{dir_path}/../js/dist/anki-persistence.js', mode='r', encoding='utf-8') as template_anki_persistence:
        anki_persistence = template_anki_persistence.read() + '\n'

    for template in model['tmpls']:
        before = f'<div id="set-randomizer-container"> <!-- SET RANDOMIZER AUTOGEN DIV -->'
        after = f'</div> <!-- SET RANDOMIZER AUTOGEN DIV -->'

        if settings.css_query_auto_generate:
            template['qfmt'] = f'{before}\n{template["qfmt"]}\n{after}'
            template['afmt'] = f'{before}\n{template["afmt"]}\n{after}'

        template['qfmt'] = f'{template["qfmt"]}\n\n<script>\n// SET RANDOMIZER FRONT TEMPLATE {util.versionString}\n{anki_persistence if settings.inject_anki_persistence else ""}{js_front}</script>'
        template['afmt'] = f'{template["afmt"]}\n\n<script>\n// SET RANDOMIZER BACK TEMPLATE {util.versionString}\n{anki_persistence if settings.inject_anki_persistence else ""}{js_back}</script>'
