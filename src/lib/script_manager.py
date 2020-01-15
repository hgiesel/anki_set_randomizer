from aqt import mw
from aqt.utils import showInfo
from anki.hooks import addHook

from .utils import find_addon_by_name, version_string, addon_name, description_text, fake_code_text
from .model_editor import get_sr_code, get_anki_persistence_code, update_model_template
from .config import get_setting

def get_script(_id, _storage, model, tmpl, fmt) -> str:
    try:
        tmpl_obj = next(filter(lambda v: v['name'] == tmpl, mw.col.models.byName(model)['tmpls']))
        # remove the old insertion
        update_model_template(tmpl_obj, fmt, '')

    except StopIteration:
        # What happened?
        pass

    st = get_setting(model)
    code = get_sr_code(st, tmpl, fmt)

    return code

def activate_script_manager() -> bool:
    sm = find_addon_by_name('Script Manager')

    if not sm:
        return False

    smi = __import__(sm).src.lib.interface
    smr = __import__(sm).src.lib.registrar

    script_name = addon_name
    version = version_string
    description = description_text
    fake_code = fake_code_text

    from pathlib import Path
    from os.path import dirname, realpath

    smr.register_interface(
        smi.make_interface(
            tag = f"set_randomizer",

            getter = lambda id, storage: smi.make_script(
                storage.enabled if storage.enabled is not None else True,
                script_name,
                version,
                description,
                storage.conditions if storage.conditions is not None else [],
                fake_code,
            ),
            setter = lambda id, script: True,

            store = ['enabled', 'conditions'],
            readonly = ['name', 'version', 'description', 'code'],

            label = lambda _id, _storage: 'Set Randomizer',
            reset = False,

            generator = get_script,
        )
    )

    ap_code = 'For the actual code, go to \'https://github.com/SimonLammer/anki-persistence\'.'

    smr.register_interface(
        smi.make_interface(
            tag = f"anki_persistence",

            getter = lambda id, storage: smi.make_script(
                storage.enabled if storage.enabled is not None else True,
                'Anki Persistence',
                'v0.5.3',
                'Persist data between both sides of an anki flashcard.',
                storage.conditions if storage.conditions is not None else [],
                ap_code,
            ),
            setter = lambda id, script: True,

            store = ['enabled', 'conditions'],
            readonly = ['name', 'version', 'description', 'code'],

            label = lambda _id, _storage: 'Anki Persistence',
            reset = False,

            generator = lambda _id, _storage, _model, _tmpl, _fmt: get_anki_persistence_code(),
        )
    )

    sr_ms = smi.make_meta_script(
        f"set_randomizer",
        f"main_code"
    )

    ap_ms = smi.make_meta_script(
        f"anki_persistence",
        f"anki_persistence"
    )

    def install_script():
        for model_name in mw.col.models.allNames():
            st = get_setting(model_name)

            if st.enabled:
                # Anki Persistence first bc it makes sense
                if st.insert_anki_persistence:
                    smr.register_meta_script(
                        model_name,
                        ap_ms,
                    )

                smr.register_meta_script(
                    model_name,
                    sr_ms,
                )

    addHook('profileLoaded', install_script)
    return True
