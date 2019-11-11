from aqt import mw
from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from .lib import config
from .setup import setup_editor, setup_menu_option

# from .occluder.custom.sr_occluder import SROccluder

# def debugOpenWindow():
#     dialog = SROccluder(mw)
#     dialog.setupUi()
#     return dialog.exec_()

def init():
    addHook('profileLoaded', setup_menu_option)
    setup_editor()

init()
