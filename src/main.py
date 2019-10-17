from aqt import mw
from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from .lib import config
from .lib import model_editor

from .gui.custom.sr_config import SRConfigDialog, write_back

def setup_menu_option():
    action = QAction('Set Randomizer Settings...', mw)

    def invoke_options():
        dialog = SRConfigDialog(mw)
        dialog.setupUi(config.get_settings())

        return dialog.exec_()

    action.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(action)

def default_write():
    settings = config.get_settings()
    write_back(settings)
    setup_menu_option()

def init():
    addHook('profileLoaded', default_write)

init()
