from aqt.qt import QWidget

from ..sr_setting_add_replace import Ui_SRSettingAddReplace

class SRSettingAddReplace(QWidget):
    def __init__(self):
        super().__init__()

        self.ui = Ui_SRSettingAddReplace()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)
        self.ui.addButton.clicked.connect(self.add)
        self.ui.replaceButton.clicked.connect(self.replace)

        self.ui.validateButton.clicked.connect(self.validate)

    def setupUi(self):
        pass
