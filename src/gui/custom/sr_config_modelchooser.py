from aqt.qt import QComboBox

class SRConfigModelchooser(QComboBox):

    def __init__(self, mw):

        super().__init__(parent=mw)

    def setupUi(self, modelNames, updateFunc):

        self.addItems(modelNames)
        self.currentIndexChanged.connect(updateFunc)
