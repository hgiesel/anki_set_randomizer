from aqt import QAction, mw
from aqt.editor import Editor
from anki.hooks import wrap, addHook

from .wrapper import on_cloze
from .lib.config import get_settings
from .gui_config.custom.sr_config import SRConfigDialog

def setup_editor():
    Editor.onCloze = wrap(Editor.onCloze, on_cloze, "around")

def invoke_options():
    dialog = SRConfigDialog(mw)
    dialog.setupUi(get_settings())

    return dialog.exec_()

def setup_addon_manager():
    mw.addonManager.setConfigAction(__name__, invoke_options)

def setup_menu_option():
    action = QAction('Set Randomizer Settings...', mw)
    action.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(action)
    # debugOpenWindow()
