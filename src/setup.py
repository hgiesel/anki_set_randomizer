from aqt import QAction, mw
from aqt.editor import Editor
from anki.hooks import wrap, addHook

from .wrapper import on_cloze
from .gui_config.custom.sr_config import SRConfigDialog
from .lib.config import get_settings

def setup_editor():
    Editor.onCloze = wrap(Editor.onCloze, on_cloze, "around")

def setup_invoke(sm_installed):
    def invoke_options():
        dialog = SRConfigDialog(mw, sm_installed)
        dialog.setupUi(get_settings())

        return dialog.exec_()

    return invoke_options

def setup_config_dialog(sm_installed):
    def setup_menu_option():
        action = QAction('Set Randomizer Settings...', mw)
        action.triggered.connect(setup_invoke(sm_installed))
        mw.form.menuTools.addAction(action)

    def setup_addon_manager():
        mw.addonManager.setConfigAction(__name__, setup_invoke(sm_installed))

    addHook('profileLoaded', setup_menu_option)
    addHook('profileLoaded', setup_addon_manager)
