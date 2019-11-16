from aqt.qt import QTabWidget

from ..sr_config_tabwidget_ui import Ui_SRConfigTabwidget
from ...lib.config import deserialize_setting

class SRConfigTabwidget(QTabWidget):

    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRConfigTabwidget()
        self.ui.setupUi(self)

        self.setCurrentIndex(0)

    def setupUi(self, setting):
        self.ui.generalTab.setupUi(
            setting.model_name,
            setting.description,
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

        self.ui.sourceModeTab.setupUi(
            setting.source_mode,
        )

    def exportData(self):
        modelName, description, enabled, insertAnkiPersistence, pasteIntoTemplate = self.ui.generalTab.exportData()

        result = deserialize_setting(modelName, {
            'description': description,
            'enabled': enabled,
            'insertAnkiPersistence': insertAnkiPersistence,
            'parseIntoTemplate': pasteIntoTemplate,
            'iterations': self.ui.iterationTab.exportData(),
            'injections': self.ui.injectionTab.exportData(),
            'sourceMode': self.ui.sourceModeTab.exportData(),
        })

        return result
