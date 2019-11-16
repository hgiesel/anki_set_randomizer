from aqt.qt import QDialog, QWidget, QAction, Qt
from anki.hooks import addHook

from ..sr_iteration_frontback_ui import Ui_SRIterationFrontback

class SRIterationFrontback(QDialog):
    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRIterationFrontback()
        self.ui.setupUi(self)

        self.ui.tabWidget.setCurrentIndex(0)

        self.ui.copyIsToOtherSideButton.clicked.connect(self.copyIsToOtherSide)
        self.ui.copyDsToOtherSideButton.clicked.connect(self.copyDsToOtherSide)

        self.accepted.connect(self.onAccept)
        self.rejected.connect(self.onReject)

        self.ui.saveButton.clicked.connect(self.accept)
        self.ui.saveButton.setDefault(True)

        self.ui.cancelButton.clicked.connect(self.reject)
        self.ui.importButton.clicked.connect(self.importDialog)

    def setupUi(self, iterations, callback):
        self.callback = callback

        # use front name and cut off prefix
        self.ui.iterationNameLineEdit.setText(iterations[0].name[1:])

        self.ui.frontside.setupUi(iterations[0])
        self.ui.backside.setupUi(iterations[1])

    def onAccept(self):
        self.callback(self.exportData())

    def onReject(self):
        pass

    def updateName(self):
        newName = self.ui.iterationNameLineEdit.text()

        self.ui.frontside.updateName(f'-{newName}')
        self.ui.backside.updateName(f'+{newName}')

    def copyIsToOtherSide(self):
        if self.ui.tabWidget.currentIndex() == 0:
            self.ui.backside.setupIs(self.getFrontIs())
        else:
            self.ui.frontside.setupIs(self.getBackIs())

    def copyDsToOtherSide(self):
        if self.ui.tabWidget.currentIndex() == 0:
            self.ui.backside.setupDs(self.getFrontDs())
        else:
            self.ui.frontside.setupDs(self.getBackDs())

    def getFrontIs(self):
        return self.ui.frontside.exportIs()

    def getBackIs(self):
        return self.ui.backside.exportIs()

    def getFrontDs(self):
        return self.ui.frontside.exportDs()

    def getBackDs(self):
        return self.ui.backside.exportDs()

    def getFrontData(self):
        return self.ui.frontside.exportData()

    def getBackData(self):
        return self.ui.backside.exportData()

    def exportData(self):
        self.updateName()

        return [
            self.getFrontData(),
            self.getBackData(),
        ]

    #########

    def importDialog(self):
        pass
