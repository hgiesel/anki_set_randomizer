import json
import os

from pathlib import Path
from jsonschema import RefResolver, Draft7Validator

from aqt import mw
from aqt.qt import QWidget, QLabel, Qt

from ...lib.config import deserialize_injection, serialize_injection
from ..sr_injection_tab_ui import Ui_SRInjectionTab

from .sr_setting_add_replace import SRSettingAddReplace
from .sr_injection_config import SRInjectionConfig

from .util import mapTruthValueToIcon

class SRInjectionTab(QWidget):
    def __init__(self):
        super().__init__()

        self.ui = Ui_SRInjectionTab()
        self.ui.setupUi(self)

        self.ui.addPushButton.clicked.connect(self.addInjection)
        self.ui.deletePushButton.clicked.connect(self.deleteInjection)
        self.ui.downPushButton.clicked.connect(self.moveDown)
        self.ui.upPushButton.clicked.connect(self.moveUp)
        self.ui.importButton.clicked.connect(self.importDialog)

        self.ui.injectionsTable.currentCellChanged.connect(self.updateButtonsForCurrentCell)
        self.ui.injectionsTable.cellDoubleClicked.connect(self.editInjection)
        self.ui.injectionsTable.setColumnWidth(1, 55)

    def setupUi(self, injections):
        self.inj = injections
        self.drawInjections()

        self.updateButtons(False)

    def drawInjections(self):
        self.ui.injectionsTable.clearContents()
        self.ui.injectionsTable.setRowCount(len(self.inj))

        headerLabels = []

        for idx, inj in enumerate(self.inj):
            headerLabels.append(f'Injection {idx}')

            self.setRowMod(
                idx,
                inj.name,
                mapTruthValueToIcon(inj.enabled),
                json.dumps(inj.conditions),
            )

        self.ui.injectionsTable.setVerticalHeaderLabels(headerLabels)

    def setRowMod(self, row, name, enabled, conditions):
        for i, text in enumerate([name, enabled, conditions]):
            label = QLabel()
            label.setText(text)
            label.setAlignment(Qt.AlignCenter)

            self.ui.injectionsTable.setCellWidget(row, i, label)

    def editInjection(self, row, column):
        def saveInjection(newInjection):
            self.inj[row] = newInjection
            self.drawInjections()

        a = SRInjectionConfig(mw, saveInjection)
        a.setupUi(self.inj[row])
        a.exec_()

    ###########

    def updateButtonsForCurrentCell(self, currentRow, currentColumn, previousRow, previousColumn):
        self.updateButtons(currentRow != -1)

    def updateButtons(self, state=True):
        self.ui.deletePushButton.setEnabled(state)
        self.ui.downPushButton.setEnabled(state)
        self.ui.upPushButton.setEnabled(state)

    def addInjection(self):
        newInjection = deserialize_injection({
            'name': 'New Injection',
            'description': '',
            'enabled': True,
            'conditions': [],
            'statements': [],
        })

        self.inj.append(newInjection)
        self.drawInjections()

    def deleteInjection(self):
        del self.inj[self.ui.injectionsTable.currentRow()]

        self.drawInjections()
        self.updateButtons(False)

    def moveDown(self):
        i = self.ui.injectionsTable.currentRow()

        if len(self.inj) != 1 and i < len(self.inj) - 1:
            self.inj[i], self.inj[i + 1] = self.inj[i + 1], self.inj[i]
            self.drawInjections()
            self.ui.injectionsTable.setCurrentCell(i + 1, 0)

    def moveUp(self):
        i = self.ui.injectionsTable.currentRow()

        if len(self.inj) != 1 and i > 0:
            self.inj[i], self.inj[i - 1] = self.inj[i - 1], self.inj[i]
            self.drawInjections()
            self.ui.injectionsTable.setCurrentCell(i - 1, 0)

    ###########

    def exportData(self):
        return self.inj

    def importDialog(self):
        def addAfterImport(injections_new):
            self.setupUi(self.inj + [deserialize_injection(inj) for inj in injections_new])

        def replaceAfterImport(injections_new):
            self.setupUi([deserialize_injection(inj) for inj in injections_new])

        dirpath = Path(f'{os.path.dirname(os.path.realpath(__file__))}', '../../json_schemas/injections.json')
        schema_path = dirpath.absolute().as_uri()

        with dirpath.open('r') as jsonfile:
            schema = json.load(jsonfile)
            resolver = RefResolver(
                schema_path,
                schema,
            )

            validator = Draft7Validator(schema, resolver=resolver, format_checker=None)

            dial = SRSettingAddReplace(mw)
            dial.setupUi(
                json.dumps([serialize_injection(inj) for inj in self.inj], sort_keys=True, indent=4),
                validator,
                addAfterImport,
                replaceAfterImport,
            )
            dial.exec_()
