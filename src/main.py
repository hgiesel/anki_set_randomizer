from aqt import mw
from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from .lib import config
from .setup import setup_config_dialog, setup_editor
from .lib.script_manager import activate_script_manager

# from .occluder.custom.sr_occluder import SROccluder

# def debugOpenWindow():
#     dialog = SROccluder(mw)
#     dialog.setupUi()
#     return dialog.exec_()

def init():
    sm_installed = activate_script_manager
    setup_config_dialog(sm_installed)
    setup_editor()

init()
