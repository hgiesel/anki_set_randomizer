import re

from aqt import Qt, QAction, mw

from aqt.editor import Editor
from anki.hooks import wrap, addHook

from .lib.config import get_settings
from .gui.custom.sr_config import SRConfigDialog

from aqt.utils import showInfo

def get_sm_config(model_name):
    settings = get_settings(model_name)

    try:
        return settings.source_mode.cloze_options
    except:
        return None

def on_cloze(self, _old):
    sm_config = get_sm_config(self.note.model()['name'])

    if sm_config and sm_config.shortcuts_enabled:
        matches = []

        for name, item in self.note.items():
            query = f'{re.escape(sm_config.open_delim)}\\${re.escape(sm_config.vs_prefix)}(\d+)'
            matches.extend(re.findall(query, item))

        values = [0]
        values.extend([int(x) for x in matches])

        top = max(values)

        if not self.mw.app.keyboardModifiers() & Qt.AltModifier:
            top = top + 1
        else:
            top = top + 1 if top == 0 else top

        cmd = f'wrap(\'{sm_config.open_delim}${sm_config.vs_prefix}{top}|\', \'{sm_config.close_delim}\');'
        self.web.eval(cmd)

    else:
        return _old(self)

def setup_editor():
    Editor.onCloze = wrap(Editor.onCloze, on_cloze, "around")

def setup_menu_option():
    action = QAction('Set Randomizer Settings...', mw)

    def invoke_options():
        dialog = SRConfigDialog(mw)
        dialog.setupUi(get_settings())

        return dialog.exec_()

    action.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(action)
    # debugOpenWindow()
