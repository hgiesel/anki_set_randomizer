from aqt.utils import showInfo

from aqt.qt import QDialog, QWidget, QAction, Qt
from anki.hooks import addHook

from ..sr_iteration_frontback_ui import Ui_SRIterationFrontback

class SRIterationFrontback(QDialog):

    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRIterationFrontback()
        self.ui.setupUi(self)

        self.ui.tabWidget.setCurrentIndex(0)

        self.ui.copyToOtherSideButton.clicked.connect(self.copyToOtherSide)

        self.accepted.connect(self.onAccept)
        self.rejected.connect(self.onReject)

        self.ui.saveButton.clicked.connect(self.accept)
        self.ui.cancelButton.clicked.connect(self.reject)

    def setupUi(self, iterations, callback):

        self.callback = callback

        self.ui.frontside.setupUi(iterations[0])
        self.ui.backside.setupUi(iterations[1])

    def onAccept(self):
        self.callback(self.exportData())

    def onReject(self):
        pass

    def updateName(self, newName):
        self.ui.frontside.updateName(f'-{newName}')
        self.ui.backside.updateName(f'+{newName}')

    def copyToOtherSide(self):
        if self.ui.tabWidget.currentIndex() == 0:
            self.ui.backside.setupUi(self.getFrontData())
        else:
            self.ui.frontside.setupUi(self.getBackData())

    def getFrontData(self):
        return self.ui.frontside.exportData()

    def getBackData(self):
        return self.ui.backside.exportData()

    def exportData(self):
        return [
            self.getFrontData(),
            self.getBackData(),
        ]
