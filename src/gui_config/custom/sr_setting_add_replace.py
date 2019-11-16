import json
import jsonschema

from aqt.utils import  showWarning, showInfo
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

    def setupUi(self, data, validator, adder, replacer):
        self.ui.textEdit.setPlainText(data)
        self.validator = validator
        self.adder = adder
        self.replacer = replacer

    def add(self):
        success = self.validate(showMessages = False)

        if not success:
            showInfo('Invalid data. Please correct the data and verify using the "Validate" button, or just cancel the dialog if you want to abort.')
        else:
            self.adder(json.loads(self.ui.textEdit.toPlainText()))
            self.accept()

    def replace(self):
        success = self.validate(showMessages = False)

        if not success:
            showInfo('Invalid data. Please correct the data and verify using the "Validate" button, or just cancel the dialog if you want to abort.')
        else:
            self.replacer(json.loads(self.ui.textEdit.toPlainText()))
            self.accept()
        pass

    def validate(self, checked = False, showMessages = True):
        showFail = showWarning if showMessages else lambda _: None
        showSuccess = showInfo if showMessages else lambda _: None

        try:
            json_data = json.loads(self.ui.textEdit.toPlainText())
        except json.JSONDecodeError as e:
            showFail(f'JSON has invalid form: {e}')
            return False
        except Exception as e:
            showFail(f'Other error: {e}')
            return False

        try:
            self.validator.validate(json_data)
        except jsonschema.exceptions.RefResolutionError as e:
            showFail(f'Error in the Schema: {e}')
            return False
        except jsonschema.exceptions.ValidationError as e:
            showFail(f'Validation error: {e}')
            return False

        showSuccess('Valid Setting!')
        return True
