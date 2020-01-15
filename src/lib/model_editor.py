import os
import io
import re
import base64

from json import dumps
from functools import reduce
from string import Template

from aqt import mw

from .config import serialize_iteration, serialize_injection
from .utils import version_string
from .config_types import SRIteration, SRInjection

class BetterTemplate(Template):
    delimiter = '$$'

def setup_models(settings):
    for st in settings:
        model = mw.col.models.byName(st.model_name)

        for tmpl in model['tmpls']:
            cardtype_name = tmpl['name']

            for fmt in ['qfmt', 'afmt']:
                if st.enabled:
                    code = get_sr_code(st, cardtype_name, fmt)
                    file_name = get_filename(model, cardtype_name, fmt)

                    paste_method = (
                        paste_sr_into_template
                        if st.paste_into_template
                        else create_sr_file
                    )

                    code_wrapped = wrap_code_segment(
                        paste_method(code, file_name, st.insert_anki_persistence),
                        gen_data_attributes(fmt),
                    )

                    update_model_template(tmpl, fmt, code_wrapped)

                else:
                    update_model_template(tmpl, fmt, '')


        # notify anki that models changed (for synchronization e.g.)
        mw.col.models.save(model)

def get_filename(model, cardtype_name, fmt):
    return f'_{fmt_to_frontback(fmt)}{model["id"]}_{cardtype_name}.js'

def fmt_to_frontback(fmt):
    side = 'Front' if fmt == 'qfmt' else 'Back'
    return side

def gen_data_attributes(fmt):
    return f'data-name="Set Randomizer {fmt_to_frontback(fmt)} Template" data-version="{version_string}"'

def update_model_template(tmpl, fmt, new_code: str):
    pattern = re.compile(r'\n?\n?<script[^>]*Set Randomizer (Front|Back) Template[^>]*?>.*?</script>', re.DOTALL)
    span = re.search(pattern, tmpl[fmt])

    replacement = (
        new_code.join([tmpl[fmt][:span.start()], tmpl[fmt][span.end():]])
        if bool(span)
        else tmpl[fmt] + new_code
    )

    tmpl[fmt] = replacement

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
                return True, not parsed_cond[1]
            else:
                return True, [inj[0], parsed_cond[1]]

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
            iterNames = [iter.name for iter in iterations]

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

js_path = f'{os.path.dirname(os.path.realpath(__file__))}/../../js/dist'

def get_anki_persistence_code() -> str:
    with io.open(f'{js_path}/anki-persistence.js', mode='r', encoding='utf-8') as template_anki_persistence:
        anki_persistence = template_anki_persistence.read().strip()

    return anki_persistence

def get_sr_code(setting, cardtype_name, fmt) -> str:
    minimal_sep = (',', ':')
    is_front = fmt == 'qfmt' # else 'afmt'

    the_iterations = [iter for iter in setting.iterations if iter.enabled and iter.name.startswith('-' if is_front else '+')]
    injection_parser = get_injection_condition_parser(cardtype_name, the_iterations)
    the_injections = []

    for inj in [inj for inj in setting.injections if inj.enabled]:
        needs_inject, simplified_conditions = injection_parser(inj.conditions)

        if needs_inject:
            the_injections.append({
                'statements': inj.statements,
                'conditions': simplified_conditions,
            })

    js_file_name = fmt_to_frontback(fmt)

    with io.open(f'{js_path}/{js_file_name}.js', mode='r', encoding='utf-8') as template_text:
        js_text = BetterTemplate(template_text.read()).safe_substitute(
            iterations=dumps([serialize_iteration(iter) if isinstance(iter, SRIteration) else iter for iter in the_iterations], separators=minimal_sep),
            injections=dumps([serialize_injection(inj) if isinstance(inj, SRInjection) else inj for inj in the_injections], separators=minimal_sep),
        ).strip()

    return js_text

def wrap_code_segment(code, attributes):
    return (
        '\n\n' +
        f'<script {attributes}>\n' +
        code +
        '\n</script>'
    )

def paste_sr_into_template(js_text, file_name, insert_anki_persistence) -> str:
    mw.col.media.syncDelete(file_name)

    anki_persistence_code = f'{get_anki_persistence_code()}\n' if insert_anki_persistence else ''
    addition = anki_persistence_code + js_text

    return addition

def create_sr_file(js_text, file_name, insert_anki_persistence) -> str:
    anki_persistence_code = f'{get_anki_persistence_code()}\n' if insert_anki_persistence else ''

    mw.col.media.writeData(
        file_name,
        (anki_persistence_code + js_text).encode('ascii'),
    )

    addition = (
        'var script = document.createElement("script")' +
        f'script.src = "{file_name}"' +
        'document.getElementsByTagName(\'head\')[0].appendChild(script)'
    )

    return addition
