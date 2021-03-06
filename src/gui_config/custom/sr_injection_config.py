import os
import json

import jsonschema
from jsonschema import validate, RefResolver, Draft7Validator
from pathlib import Path

from aqt import mw
from aqt.qt import QDialog, QWidget, Qt
from aqt.utils import showInfo # actually needed!

from .sr_setting_update import SRSettingUpdate

from ..sr_injection_config_ui import Ui_SRInjectionConfig

from ...lib.config import deserialize_injection, serialize_injection

class SRInjectionConfig(QDialog):
    def __init__(self, parent, callback):
        super().__init__(parent=parent)

        self.callback = callback

        self.ui = Ui_SRInjectionConfig()
        self.ui.setupUi(self)

        self.accepted.connect(self.onAccept)
        self.rejected.connect(self.onReject)

        self.ui.saveButton.clicked.connect(self.tryAccept)
        self.ui.saveButton.setDefault(True)

        self.ui.cancelButton.clicked.connect(self.reject)

        self.ui.validateButton.clicked.connect(self.validateConditions)
        self.ui.addButton.clicked.connect(self.addEmptyStatement)
        self.ui.deleteButton.clicked.connect(self.deleteCurrentItem)

        self.ui.importButton.clicked.connect(self.importDialog)

        self.ui.enableInjectionCheckBox.stateChanged.connect(self.enableChangeGui)

    def setupUi(self, injection):
        self.ui.nameLineEdit.setText(injection.name)
        self.ui.descriptionTextEdit.setPlainText(injection.description)

        self.ui.enableInjectionCheckBox.setChecked(injection.enabled)

        self.ui.conditionsTextEdit.setPlainText(json.dumps(injection.conditions))
        self.ui.statementsList.clear()
        for statement in injection.statements:
            self.ui.statementsList.addItem(statement)
            self.makeItemEditable(self.ui.statementsList.count() - 1)

        self.enableChangeGui()

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
        dirpath  = Path(f'{os.path.dirname(os.path.realpath(__file__))}', '../../json_schemas/injection_cond.json')
        schema_path = dirpath.absolute().as_uri()

        with dirpath.open('r') as jsonfile:

            schema = json.load(jsonfile)
            resolver = RefResolver(
                schema_path,
                schema,
            )

            validator = Draft7Validator(schema, resolver=resolver, format_checker=None)
            instance = self.getConditions()

            validator.validate(instance)

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
        result = deserialize_injection({
            'name': self.ui.nameLineEdit.text(),
            'description': self.ui.descriptionTextEdit.toPlainText(),
            'enabled': self.ui.enableInjectionCheckBox.isChecked(),
            'conditions': self.getConditions(),
            'statements': [self.ui.statementsList.item(i).text() for i in range(self.ui.statementsList.count())],
        })
        return result

    def importDialog(self):
        def updateAfterImport(new_injection):
            self.setupUi(deserialize_injection(new_injection))

        dirpath = Path(f'{os.path.dirname(os.path.realpath(__file__))}', '../../json_schemas/inj.json')
        schema_path = dirpath.absolute().as_uri()

        with dirpath.open('r') as jsonfile:
            schema = json.load(jsonfile)
            resolver = RefResolver(
                schema_path,
                schema,
            )

            validator = Draft7Validator(schema, resolver=resolver, format_checker=None)

            dial = SRSettingUpdate(mw)
            dial.setupUi(
                json.dumps(serialize_injection(self.exportData()), sort_keys=True, indent=4),
                validator,
                updateAfterImport,
            )
            dial.exec_()
