from itertools import groupby
from copy import deepcopy

from aqt import mw

from aqt.qt import QWidget, QLabel, Qt

from .util import mapTruthValueToIcon

from .sr_iteration_frontback import SRIterationFrontback
from ..sr_iteration_tab_ui import Ui_SRIterationTab

from ...lib.config_types import SRIteration

def mapSyntaxToExample(openDelim, closeDelim, fieldSeparator):
    return f'{openDelim} item1 {fieldSeparator} item2 {closeDelim}'

# sorts and groups -1 with +1, -2 with +2, etc.
def groupIterations(its):

    def sort_negative_first(v):
        return abs(int(v.name)) * 2 if int(v.name) < 0 else abs(int(v.name)) * 2 + 1

    result = []

    for k, group in groupby(sorted(its, key=sort_negative_first), lambda v: abs(int(v.name))):
        result.append(list(group))

    return result

class SRIterationTab(QWidget):

    def __init__(self):
        super().__init__()

        self.ui = Ui_SRIterationTab()
        self.ui.setupUi(self)

        self.ui.duplicatePushButton.clicked.connect(self.duplicateIteration)
        self.ui.deletePushButton.clicked.connect(self.deleteIteration)
        self.ui.downPushButton.clicked.connect(self.moveDown)
        self.ui.upPushButton.clicked.connect(self.moveUp)

        self.ui.iterationsTable.currentCellChanged.connect(self.updateButtonsForCurrentCell)
        self.ui.iterationsTable.cellDoubleClicked.connect(self.editIteration)
        self.ui.iterationsTable.setColumnWidth(0, 80)
        self.ui.iterationsTable.setColumnWidth(2, 80)

    def setupUi(self, iterations):
        self.ic = iterationCouples = list(filter(lambda v: len(v) == 2, groupIterations(iterations)))
        self.drawIterations()

        self.updateButtons(False)

    def drawIterations(self):
        self.ui.iterationsTable.clearContents()
        self.ui.iterationsTable.setRowCount(len(self.ic))

        headerLabels = []

        for idx, iter in enumerate(self.ic):
            headerLabels.append(f'Iteration {idx + 1}')

            self.setRowMod(
                idx,
                mapTruthValueToIcon(iter[0].enabled),
                mapSyntaxToExample(iter[0].input_syntax.open_delim, iter[0].input_syntax.close_delim, iter[0].input_syntax.field_separator),
                mapTruthValueToIcon(iter[1].enabled),
                mapSyntaxToExample(iter[1].input_syntax.open_delim, iter[1].input_syntax.close_delim, iter[1].input_syntax.field_separator),
            )

        self.ui.iterationsTable.setVerticalHeaderLabels(headerLabels)

    def setRowMod(self, row, frontEnabled, frontText, backEnabled, backText):
        for i, text in enumerate([frontEnabled, frontText, backEnabled, backText]):
            label = QLabel()
            label.setText(text)
            label.setAlignment(Qt.AlignCenter)

            self.ui.iterationsTable.setCellWidget(row, i, label)

    def editIteration(self, row, column):

        def saveIterations(newIterations):
            self.ic[row] = newIterations
            self.drawIterations()

        a = SRIterationFrontback(mw)
        a.setupUi(self.ic[row], saveIterations)
        a.exec_()

    #################
    def updateButtonsForCurrentCell(self, currentRow, currentColumn, previousRow, previousColumn):
        self.updateButtons(currentRow != -1)

    def updateButtons(self, state=True):
        self.ui.duplicatePushButton.setEnabled(state)
        self.ui.deletePushButton.setEnabled(state)
        self.ui.downPushButton.setEnabled(state)
        self.ui.upPushButton.setEnabled(state)

    def duplicateIteration(self):
        newIteration = deepcopy(self.ic[self.ui.iterationsTable.currentRow()])
        self.ic.append(newIteration)
        self.drawIterations()

    def deleteIteration(self):
        if len(self.ic) > 1:
            del self.ic[self.ui.iterationsTable.currentRow()]
            self.drawIterations()

    def moveDown(self):
        i = self.ui.iterationsTable.currentRow()

        if len(self.ic) != 1 and i < len(self.ic) - 1:
            self.ic[i], self.ic[i + 1] = self.ic[i + 1], self.ic[i]
            self.drawIterations()
            self.ui.iterationsTable.setCurrentCell(i + 1, 0)

    def moveUp(self):
        i = self.ui.iterationsTable.currentRow()

        if len(self.ic) != 1 and i > 0:
            self.ic[i], self.ic[i - 1] = self.ic[i - 1], self.ic[i]
            self.drawIterations()
            self.ui.iterationsTable.setCurrentCell(i - 1, 0)

    def exportData(self):
        result = []

        # flatten iterations
        for idx, sublist in enumerate(self.ic, start=1):
            result.append(sublist[0]._replace(name=f'-{idx}'))
            result.append(sublist[1]._replace(name=f'+{idx}'))

        return result