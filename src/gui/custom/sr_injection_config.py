import os
import json
import jsonschema

from aqt.utils import showInfo
from aqt.qt import QDialog, QWidget, Qt

from ..sr_injection_config_ui import Ui_SRInjectionConfig

from ...lib.config_types import SRInjection

class SRInjectionConfig(QDialog):

    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRInjectionConfig()
        self.ui.setupUi(self)

        self.accepted.connect(self.onAccept)
        self.rejected.connect(self.onReject)

        self.ui.saveButton.clicked.connect(self.tryAccept)
        self.ui.cancelButton.clicked.connect(self.reject)

        self.ui.validateButton.clicked.connect(self.validateConditions)
        self.ui.addButton.clicked.connect(self.addEmptyStatement)
        self.ui.deleteButton.clicked.connect(self.deleteCurrentItem)

        self.ui.enableInjectionCheckBox.stateChanged.connect(self.enableChangeGui)

    def setupUi(self, injection, callback):

        self.callback = callback

        self.ui.nameLineEdit.setText(injection.name)

        self.ui.enableInjectionCheckBox.setChecked(injection.enabled)
        self.enableChangeGui()

        self.ui.conditionsTextEdit.setPlainText(json.dumps(injection.conditions))

        self.ui.statementsList.clear()
        for statement in injection.statements:
            self.ui.statementsList.addItem(statement)
            self.makeItemEditable(self.ui.statementsList.count() - 1)

    def tryAccept(self):

        try:
            self.validateConditionsRaw()
        except:
            showInfo('Invalid Conditions. Please correct the conditions or just set it to `[]`.')
        else:
            self.accept()


    def onAccept(self):
        self.callback(self.exportData())

    def onReject(self):
        pass

    def enableChangeGui(self):
        self.enableChange(self.ui.enableInjectionCheckBox.isChecked())

    def enableChange(self, state=True):
        self.ui.conditionsTextEdit.setReadOnly(not state)

        self.ui.addButton.setEnabled(state)
        self.ui.deleteButton.setEnabled(state)

        self.makeItemsEditable(state)

    def getConditions(self): # can throw
        return json.loads(self.ui.conditionsTextEdit.toPlainText())

    def validateConditionsRaw(self):
        schema_path = f'{os.path.dirname(os.path.realpath(__file__))}/../../lib/injection_cond.json'

        with open(schema_path, 'r') as jsonfile:

            schema = json.load(jsonfile)
            instance = self.getConditions()

            jsonschema.validate(instance, schema)

    def validateConditions(self):

        try:
            self.validateConditionsRaw()
        except json.decoder.JSONDecodeError as e:
            showInfo(str(e))
        except jsonschema.exceptions.ValidationError as e:
            showInfo(str(e))
        else:
            showInfo('Valid Conditions.')

    def makeItemEditable(self, idx, state=True):
        item = self.ui.statementsList.item(idx)
        if state:
            item.setFlags(Qt.ItemIsSelectable | Qt.ItemIsEditable | Qt.ItemIsDragEnabled | Qt.ItemIsDropEnabled | Qt.ItemIsEnabled)
        else:
            item.setFlags(Qt.NoItemFlags)

    def makeItemsEditable(self, state=True):
        for idx in range(self.ui.statementsList.count()):
            self.makeItemEditable(idx, state)

    def addEmptyStatement(self):
        self.ui.statementsList.addItem('New Statement')
        self.makeItemEditable(self.ui.statementsList.count() - 1)

    def deleteCurrentItem(self):
        idx = self.ui.statementsList.currentRow() or self.ui.statementsList.count() - 1
        if idx != -1:
            self.ui.statementsList.takeItem(idx)

    def exportData(self):

        return SRInjection(
            self.ui.nameLineEdit.text(),
            self.ui.enableInjectionCheckBox.isChecked(),
            self.getConditions(),
            [self.ui.statementsList.item(i).text() for i in range(self.ui.statementsList.count())],
        )
