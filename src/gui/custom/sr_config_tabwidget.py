from aqt.qt import QTabWidget

from ..sr_config_tabwidget_ui import Ui_SRConfigTabwidget
from ...lib.config_types import SRSetting

class SRConfigTabwidget(QTabWidget):

    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRConfigTabwidget()
        self.ui.setupUi(self)

        self.setCurrentIndex(0)

    def setupUi(self, setting):
        self.ui.generalTab.setupUi(
            setting.model_name,
            setting.enabled,
            setting.insert_anki_persistence,
            setting.paste_into_template,
        )

        self.ui.iterationTab.setupUi(
            setting.iterations,
        )

        self.ui.injectionTab.setupUi(
            setting.injections,
        )

    def exportData(self):
        modelName, enabled, insertAnkiPersistence, pasteIntoTemplate = self.ui.generalTab.exportData()

        return SRSetting(
            modelName,
            enabled,
            insertAnkiPersistence,
            pasteIntoTemplate,
            self.ui.iterationTab.exportData(),
            self.ui.injectionTab.exportData(),
        )
