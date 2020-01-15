from aqt import mw
from aqt.utils import showInfo

from .utils import find_addon_by_name, version_string

sm = find_addon_by_name('Script Manager')

def get_script(id, storage, model, tmpl, fmt) -> str:
    pass

if sm:
    smi = __import__(sm).src.lib.interface
    smr = __import__(sm).src.lib.registrar

    script_name = 'Set Randomizer'
    version = version_string
    description = 'This script allows you to use a special syntax on the card, which you can use to do shuffling, random generation, and more.'

    fake_code = """
(it's complicated, trust me)
    """.strip()

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
