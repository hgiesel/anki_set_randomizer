from itertools import groupby

from aqt.qt import QDialog, QWidget, QAction
from aqt.utils import getText, showWarning, showInfo

from ...lib.model_editor import setup_models
from ...lib.config_types import SRSetting, SRIteration, SRInjection
from ...lib.config import write_settings

from ..sr_config_ui import Ui_SRConfig

from .sr_config_tabwidget import SRConfigTabwidget

def sort_negative_first(v):
    return abs(int(v.name)) * 2 if int(v.name) < 0 else abs(int(v.name)) * 2 + 1

def write_back(settings):
    write_settings(settings)
    setup_models(settings)

class SRConfigDialog(QDialog):
    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRConfig()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)

    def setupUi(self, settings, startId=0):
        def saveCurrentSetting(isClicked):
            nonlocal self
            nonlocal settings

            setting_data = self.ui.tabWidget.exportData()
            oldSid = self.ui.modelChooser.findText(setting_data.model_name)
            settings[oldSid] = setting_data

            write_back(settings)

            self.accept()

        self.ui.saveButton.clicked.connect(saveCurrentSetting)

        def updateTabWidgetFromModelchooser(newSid):
            nonlocal self
            nonlocal settings

            setting_data = self.ui.tabWidget.exportData()
            oldSid = self.ui.modelChooser.findText(setting_data.model_name)
            settings[oldSid] = setting_data

            self.updateTabWidget(settings[newSid])

        self.ui.modelChooser.setupUi(
            list(map(
                lambda v: v.model_name,
                settings,
            )),
            updateTabWidgetFromModelchooser,
        )

        self.updateTabWidget(settings[startId])

    def updateTabWidget(self, setting):
        self.ui.tabWidget.setupUi(setting)
