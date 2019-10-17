from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from ...lib import config

from ..sr_general_tab_ui import Ui_SRGeneralTab

class SRGeneralTab(QWidget):

    def __init__(self):
        super().__init__()

        self.ui = Ui_SRGeneralTab()
        self.ui.setupUi(self)

    def setupUi(self, modelName, enabled,
                insertAnkiPersistence, pasteIntoTemplate):

        self.ui.nameLineEdit.setText(modelName)
        self.ui.enableCheckBox.setChecked(enabled)
        self.ui.insertAnkiPersistenceCheckBox.setChecked(insertAnkiPersistence)
        self.ui.pasteIntoCardTemplateCheckBox.setChecked(pasteIntoTemplate)

    def exportData(self):

        return [
            self.ui.nameLineEdit.text(),
            self.ui.enableCheckBox.isChecked(),
            self.ui.insertAnkiPersistenceCheckBox.isChecked(),
            self.ui.pasteIntoCardTemplateCheckBox.isChecked(),
        ]
