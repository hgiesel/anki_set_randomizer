from aqt.qt import QWidget

from ..sr_setting_update import Ui_SRSettingUpdate

class SRSettingUpdate(QWidget):
    def __init__(self):
        super().__init__()

        self.ui = Ui_SRSettingUpdate()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)
        self.ui.updateButton.clicked.connect(self.update)

        self.ui.validateButton.clicked.connect(self.validate)

    def setupUi(self):
        pass
