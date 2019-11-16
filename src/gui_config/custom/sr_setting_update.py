import json
import jsonschema

from aqt.qt import QDialog
from aqt.utils import showWarning, showInfo

from ..sr_setting_update_ui import Ui_SRSettingUpdate

class SRSettingUpdate(QDialog):
    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SRSettingUpdate()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)
        self.ui.updateButton.clicked.connect(self.update)
        self.ui.validateButton.clicked.connect(self.validate)

    def setupUi(self, data, validator, updater):
        self.ui.textEdit.setPlainText(data)
        self.validator = validator
        self.updater = updater

    def update(self):
        success = self.validate(showMessages = False)

        if not success:
            showInfo('Invalid data. Please correct the data and verify using the "Validate" button, or just cancel the dialog if you want to abort.')
        else:
            self.updater(json.loads(self.ui.textEdit.toPlainText()))
            self.accept()

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
