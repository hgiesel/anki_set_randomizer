from aqt.qt import QDialog

from ..sr_setting_add_replace_ui import Ui_SRSettingAddReplace

class SRSettingAddReplace(QDialog):
    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRSettingAddReplace()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)
        self.ui.addButton.clicked.connect(self.add)
        self.ui.replaceButton.clicked.connect(self.replace)

        self.ui.validateButton.clicked.connect(self.validate)

    def setupUi(self):
        pass

    def add(self):
        pass

    def replace(self):
        pass

    def validate(self):
        pass
