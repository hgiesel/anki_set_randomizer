import json

from aqt.utils import showInfo
from aqt.qt import QDialog, QWidget, QAction, QLabel, Qt
from aqt import mw

from ...lib.config_types import SRInjection

from ..sr_injection_tab_ui import Ui_SRInjectionTab

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

        a = SRInjectionConfig(mw)
        a.setupUi(self.inj[row], saveInjection)
        a.exec_()

    ###########

    def updateButtonsForCurrentCell(self, currentRow, currentColumn, previousRow, previousColumn):
        self.updateButtons(currentRow != -1)

    def updateButtons(self, state=True):
        self.ui.deletePushButton.setEnabled(state)
        self.ui.downPushButton.setEnabled(state)
        self.ui.upPushButton.setEnabled(state)

    def addInjection(self):
        newInjection = SRInjection(
            "New Injection",
            True,
            [],
            [],
        )

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

    def exportData(self):
        return self.inj
