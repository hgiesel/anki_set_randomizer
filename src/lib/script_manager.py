from aqt import mw
from aqt.utils import showInfo

from .utils import find_addon_by_name, version_string, addon_name, description_text, fake_code_text

def get_script(_id, _storage, model, tmpl, fmt) -> str:
    model

def activate_script_manager() -> bool:
    sm = find_addon_by_name('Script Manager')

    if sm:
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
                    storage.enabled if storage.enabled else True,
                    script_name,
                    version,
                    description,
                    storage.conditions if storage.conditions else [],
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

        def install_script():
            # create the meta script which points to your interface
            my_meta_script = smi.make_meta_script(
                # this is the tag you interface above is registered on!
                f"set_randomizer",
                # your id: you can register an id only once per model per tag
                f"set_randomizer_1"
            )

            # insert the script for every model
            for model_name in mw.col.models.allNames():
                smr.register_meta_script(
                    model_name,
                    my_meta_script,
                )

        from anki.hooks import addHook
        addHook('profileLoaded', install_script)
        return True
    else:
        return False
