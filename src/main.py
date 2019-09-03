from aqt import mw
from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from .lib import config
from .lib import model_editor
from .gui.sr_config import SRConfigDialog, write_data_back

def setup_menu_option():
    action = QAction('Set Randomizer Options...', mw)

    def invoke_options():
        dialog = SRConfigDialog(mw, config.get_config_data())
        return dialog.exec_()

    action.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(action)

def default_write():
    config_data = config.get_config_data()
    write_data_back(config_data)
    setup_menu_option()

def init():
    addHook('profileLoaded', default_write)

init()
