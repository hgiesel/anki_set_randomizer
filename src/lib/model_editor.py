import os
import io
import re
import base64
from json import dumps
from functools import reduce
from string import Template

from anki import media
from aqt import mw

from .config import serialize_setting
from .utils import version_string

class BetterTemplate(Template):
    delimiter = '$$'

def setup_models(settings):
    for st in [serialize_setting(setting) for setting in settings]:
        model = mw.col.models.byName(st['modelName'])

        remove_model_template(model)

        if st['enabled']:
            update_model_template(model, st)

def gen_data_attributes(side):
    return f'data-name="Set Randomizer {side} Template" data-version="{version_string}"'

def remove_model_template(model):
    front_name = f'_front{model["id"]}.js'
    back_name = f'_back{model["id"]}.js'

    mw.col.media.syncDelete(front_name)
    mw.col.media.syncDelete(back_name)

    for template in model['tmpls']:

        template['qfmt'] = re.sub(
            '\n?<script[^>]*Set Randomizer[^>]*>.*</script>',
            '',
            template['qfmt'],
            flags=re.MULTILINE | re.DOTALL,
        ).strip()

        template['afmt'] = re.sub(
            '\n?<script[^>]*Set Randomizer[^>]*>.*</script>',
            '',
            template['afmt'],
            flags=re.MULTILINE | re.DOTALL,
        ).strip()

def get_injection_condition_parser(card, iterations):
    is_true = lambda v: type(v) == bool and v == True
    is_false = lambda v: type(v) == bool and v == False

    # [needsInjection, newInjection]
    def parse_injection(inj: list) -> [bool, list]:
        if len(inj) == 0:
            # empty conditions
            return True, inj

        elif type(inj) == bool:
            return inj, inj

        elif inj[0] == '&':
            parsed_conds = [parse_injection(i) for i in inj[1:]]
            truth_result = reduce(lambda x, y: x and y, [res[0] for res in parsed_conds])
            parsed_result = [res[1] for res in parsed_conds]

            if any([is_false(pr) for pr in parsed_result]):
                # and condition contains False
                result = False
            else:
                # filter out False
                result = list(filter(lambda v: not is_true(v), parsed_result))
                if len(result) > 1:
                    # reinsert "&"
                    result.insert(0, inj[0])
                else:
                    # flatten list, drop "&"
                    result = [item for sublist in result for item in sublist]

            return truth_result, result

        elif inj[0] == '|':
            parsed_conds = [parse_injection(i) for i in inj[1:]]
            truth_result =  reduce(lambda x, y: x or y, [res[0] for res in parsed_conds])
            parsed_result = [res[1] for res in parsed_conds]

            if any([is_true(pr) for pr in parsed_result]):
                # or condition contains True
                result = True
            else:
                # filter out True
                result = list(filter(lambda v: not is_false(v), parsed_result))
                if len(result) > 1:
                    result.insert(0, inj[0])
                else:
                    result = [item for sublist in result for item in sublist]

            return truth_result, result

        elif inj[0] == '!':
            parsed_cond = parse_injection(inj[1])

            if type(parsed_cond[1]) == bool:
                return not parsed_cond[0], not parsed_cond[1]
            else:
                return not parsed_cond[0], [inj[0], parsed_cond[1]]

        elif inj[0] == 'card':
            if inj[1] == '=':
                val = card == inj[2]

            elif inj[1] == '!=':
                val = card != inj[2]

            elif inj[1] == 'includes':
                val = inj[2] in card

            elif inj[1] == 'startsWith':
                val = card.startswith(inj[2])

            elif inj[1] == 'endsWith':
                val = card.endswith(inj[2])

            return val, val

        elif inj[0] == 'iter':
            iterNames = [iter['name'] for iter in iterations]

            if inj[1] == '=':
                truth_values = [x == inj[2] for x in iterNames]
                if len(set(truth_values)) == 1:
                    return truth_values[0], truth_values[0]
                else:
                    return reduce(lambda accu, x: accu or x, truth_values, False), inj

            elif inj[1] == '!=':
                truth_values = [x != inj[2] for x in iterNames]
                if len(set(truth_values)) == 1:
                    return truth_values[0], truth_values[0]
                else:
                    return reduce(lambda accu, x: accu or x, truth_values, False), inj

            elif inj[1] == 'includes':
                truth_values = [inj[2] in x for x in iterNames]
                if len(set(truth_values)) == 1:
                    return truth_values[0], truth_values[0]
                else:
                    return reduce(lambda accu, x: accu or x, truth_values, False), inj

            elif inj[1] == 'startsWith':
                truth_values = [x.startswith(inj[2]) for x in iterNames]
                if len(set(truth_values)) == 1:
                    return truth_values[0], truth_values[0]
                else:
                    return reduce(lambda accu, x: accu or x, truth_values, False), inj

            elif inj[1] == 'endsWith':
                truth_values = [x.endswith(inj[2]) for x in iterNames]
                if len(set(truth_values)) == 1:
                    return truth_values[0], truth_values[0]
                else:
                    return reduce(lambda accu, x: accu or x, truth_values, False), inj

        elif inj[0] == 'tag':
            return True, inj

    return parse_injection

def update_model_template(model, settings):
    js_path = f'{os.path.dirname(os.path.realpath(__file__))}/../../js/dist'
    minimal_sep = (',', ':')

    for template in model['tmpls']:
        cardtype_name = template['name']

        front_iterations = [iter for iter in settings['iterations'] if iter['enabled'] and iter['name'].startswith('-')]
        back_iterations = [iter for iter in settings['iterations'] if iter['enabled'] and iter['name'].startswith('+')]

        front_injection_parser = get_injection_condition_parser(cardtype_name, front_iterations)
        back_injection_parser = get_injection_condition_parser(cardtype_name, back_iterations)

        front_injections = []
        back_injections = []

        for inj in [inj for inj in settings['injections'] if inj['enabled']]:
            needs_front_inject, simplified_conditions_front = front_injection_parser(inj['conditions'])

            if needs_front_inject:
                front_injections.append({
                    'statements': inj['statements'],
                    'conditions': simplified_conditions_front,
                })

            needs_back_inject, simplified_conditions_back = back_injection_parser(inj['conditions'])

            if needs_back_inject:
                back_injections.append({
                    'statements': inj['statements'],
                    'conditions': simplified_conditions_back,
                })

        with io.open(f'{js_path}/front.js', mode='r', encoding='utf-8') as template_front:
            js_front = BetterTemplate(template_front.read()).safe_substitute(
                iterations=dumps(front_iterations, separators=minimal_sep),
                injections=dumps(front_injections, separators=minimal_sep),
            )

        with io.open(f'{js_path}/back.js', mode='r', encoding='utf-8') as template_back:
            js_back =  BetterTemplate(template_back.read()).safe_substitute(
                iterations=dumps(back_iterations, separators=minimal_sep),
                injections=dumps(back_injections, separators=minimal_sep),
            )

        with io.open(f'{js_path}/anki-persistence.js', mode='r', encoding='utf-8') as template_anki_persistence:
            anki_persistence = template_anki_persistence.read() + '\n'

        if settings['pasteIntoTemplate']:
            template['qfmt'] = (
                f'{template["qfmt"]}\n\n<script {gen_data_attributes("Front")}>\n'
                f'{anki_persistence if settings["insertAnkiPersistence"] else ""}{js_front}'
                f'</script>'
            )

            template['afmt'] = (
                f'{template["afmt"]}\n\n<script {gen_data_attributes("Back")}>\n'
                f'{anki_persistence if settings["insertAnkiPersistence"] else ""}{js_back}'
                f'</script>'
            )

        else:
            front_name = f'_front{model["id"]}_{cardtype_name}.js'
            back_name = f'_back{model["id"]}_{cardtype_name}.js'

            front_template = f"""\n
<script {gen_data_attributes("Front")}>
  var script = document.createElement("script")
  script.src = "{front_name}"
  document.getElementsByTagName('head')[0].appendChild(script)
</script>
"""

            back_template = f"""\n
<script {gen_data_attributes("Back")}>
  var script = document.createElement("script")
  script.src = "{back_name}"
  document.getElementsByTagName('head')[0].appendChild(script)
</script>
"""

            mw.col.media.writeData(front_name, ((
                anki_persistence
                if settings['insertAnkiPersistence']
                else '') + js_front).encode('ascii'))

            mw.col.media.writeData(back_name, ((
                anki_persistence
                if settings['insertAnkiPersistence']
                else '') + js_back).encode('ascii'))

            template['qfmt'] = template["qfmt"] + front_template
            template['afmt'] = template["afmt"] + back_template

    # notify anki that models changed (for synchronization e.g.)
    mw.col.models.save(model)
