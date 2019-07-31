from aqt.qt import *
from aqt import mw
from aqt.utils import showInfo

from .lib import config
from .lib import model_editor
from .gui import set_randomizer_option_ui

class SetRandomizerOptions(QDialog):
    """Global options dialog"""

    def __init__(self, mw):
        super().__init__(parent=mw)

        self.f = set_randomizer_option_ui.Ui_SetRandomizerOptionDialog()

        self.f.setupUi(self)
        self.setupUI()

        self.setFixedSize(self.size())

    def setupUI(self):
        self.f.buttonBox.accepted.connect(self.onAccept)
        self.f.buttonBox.rejected.connect(self.onReject)

        self.configs_data = config.get_configs_data()
        self.f.cardTypeSelector.removeItem(0)
        self.f.cardTypeSelector.addItems(list(map(lambda v: v['name'], self.configs_data)))

        self.f.cardTypeSelector.currentIndexChanged.connect(self.cardTypeSelectorChanged)
        self.f.enableCheckBox.stateChanged.connect(self.enableStateChanged)
        self.f.autoGenerateCheckBox.stateChanged.connect(self.autoGenerateStateChanged)

        self.cardTypeSelectorInit()
        self.enableStateChanged()
        self.autoGenerateStateChanged()

    def cardTypeSelectorChanged(self):
        self.cardTypeSelectorSave()
        self.cardTypeSelectorInit()

    def cardTypeSelectorSave(self):
        # current_model was saved to self.current_model
        curr_settings = list(filter(lambda v: v['name'] == self.current_model, self.configs_data))[0]
        current_settings = curr_settings['settings']

        newConfigs = config.SetRandomizerSettings(
            self.f.enableCheckBox.isChecked(),
            self.f.cssQueryLineEdit.text(),
            self.f.autoGenerateCheckBox.isChecked(),
            list(map(lambda v: v.strip(), self.f.cssColorsLineEdit.text().split(','))),
            self.f.fieldPaddingSpinBox.value(),
            current_settings.input_syntax_open_delim,
            current_settings.input_syntax_close_delim,
            current_settings.input_syntax_field_separator,
            self.f.openDelimLineEdit.text(),
            self.f.closeDelimLineEdit.text(),
            self.f.fieldSeparatorLineEdit.text(),
            current_settings.inject_anki_persistence,
        )

        curr_settings['settings'] = newConfigs

    def cardTypeSelectorInit(self):
        self.current_model = self.f.cardTypeSelector.currentText()
        current_settings   = list(filter(lambda v: v['name'] == self.current_model, self.configs_data))[0]['settings']

        self.f.enableCheckBox.setChecked(current_settings.enabled)
        self.f.cssQueryLineEdit.setText(current_settings.css_query)
        self.f.autoGenerateCheckBox.setChecked(current_settings.css_query_auto_generate)
        self.f.cssColorsLineEdit.setText(', '.join(current_settings.css_colors))
        self.f.fieldPaddingSpinBox.setValue(current_settings.field_padding)
        self.f.openDelimLineEdit.setText(current_settings.output_syntax_open_delim)
        self.f.closeDelimLineEdit.setText(current_settings.output_syntax_close_delim)
        self.f.fieldSeparatorLineEdit.setText(current_settings.output_syntax_field_separator)

    def enableStateChanged(self):
        if self.f.enableCheckBox.isChecked():
            self.f.cssQueryLineEdit.setReadOnly(False)
            self.f.cssQueryLineEdit.setEnabled(True)
            self.f.cssColorsLineEdit.setReadOnly(False)
            self.f.cssColorsLineEdit.setEnabled(True)
            self.f.autoGenerateCheckBox.setEnabled(True)

            self.f.openDelimLineEdit.setReadOnly(False)
            self.f.openDelimLineEdit.setEnabled(True)
            self.f.closeDelimLineEdit.setReadOnly(False)
            self.f.closeDelimLineEdit.setEnabled(True)
            self.f.fieldPaddingSpinBox.setEnabled(True)
            self.f.fieldSeparatorLineEdit.setReadOnly(False)
            self.f.fieldSeparatorLineEdit.setEnabled(True)

        else:
            self.f.cssQueryLineEdit.setReadOnly(True)
            self.f.cssQueryLineEdit.setEnabled(False)
            self.f.cssColorsLineEdit.setReadOnly(True)
            self.f.cssColorsLineEdit.setEnabled(False)
            self.f.autoGenerateCheckBox.setEnabled(False)

            self.f.openDelimLineEdit.setReadOnly(True)
            self.f.openDelimLineEdit.setEnabled(False)
            self.f.closeDelimLineEdit.setReadOnly(True)
            self.f.closeDelimLineEdit.setEnabled(False)
            self.f.fieldPaddingSpinBox.setEnabled(False)
            self.f.fieldSeparatorLineEdit.setReadOnly(True)
            self.f.fieldSeparatorLineEdit.setEnabled(False)

    def autoGenerateStateChanged(self):
        if self.f.autoGenerateCheckBox.isChecked():
            self.f.cssQueryLineEdit.setReadOnly(True)
            self.f.cssQueryLineEdit.setEnabled(False)
        else:
            self.f.cssQueryLineEdit.setReadOnly(False)
            self.f.cssQueryLineEdit.setEnabled(True)

    def onAccept(self):
        self.cardTypeSelectorSave()
        config.write_configs_data(self.configs_data)
        model_editor.setup_models(self.configs_data)

        self.close()

    def onReject(self):
        self.close()

def setup_menu_option():

    mult_choice = QAction('Set Randomizer Options...', mw)

    def invoke_options():
        """Invoke global config dialog"""
        dialog = SetRandomizerOptions(mw)

        return dialog.exec_()

    mult_choice.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(mult_choice)

setup_menu_option()
