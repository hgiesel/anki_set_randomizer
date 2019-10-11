from aqt.qt import QDialog, QWidget, QAction
from anki.hooks import addHook

from ..lib import config
from . import sr_injection_tab_ui

class SRInjectionTab(QWidget):

    def __init__(self, parent, option_data):
        super().__init__(parent=parent)

        self.ui = sr_injection_tab_ui.Ui_SRInjectionTab()
        self.ui.setupUi(self)

        self.setupUi(option_data)

    def setupUi(self, option_data):
        pass
        # # input syntax
        # self.ui.cssSelectorLineEdit.setText(option_data.input_syntax.css_selector)
        # self.ui.isRegexCheckBox.setChecked(option_data.input_syntax.is_regex)
        # self.ui.isOpenDelimLineEdit.setText(option_data.input_syntax.open_delim)
        # self.ui.isCloseDelimLineEdit.setText(option_data.input_syntax.close_delim)
        # self.ui.isFieldSeparatorLineEdit.setText(option_data.input_syntax.field_separator)

        # # default style
        # self.ui.cssColorsLineEdit.setText(', '.join(option_data.default_style.colors.values))
        # self.ui.cssColorsRandomStartIndexCheckBox.setChecked(option_data.default_style.colors.random_start_index)
        # self.ui.cssColorsCollectiveIndexingCheckBox.setChecked(option_data.default_style.colors.collective_indexing)

        # self.ui.htmlClassesLineEdit.setText(', '.join(option_data.default_style.classes.values))
        # self.ui.htmlClassesRandomStartIndexCheckBox.setChecked(option_data.default_style.classes.random_start_index)
        # self.ui.htmlClassesCollectiveIndexingCheckBox.setChecked(option_data.default_style.classes.collective_indexing)

        # self.ui.dsOpenDelimLineEdit.setText(option_data.default_style.open_delim)
        # self.ui.dsCloseDelimLineEdit.setText(option_data.default_style.close_delim)
        # self.ui.dsFieldSeparatorLineEdit.setText(option_data.default_style.field_separator)
        # self.ui.fieldPaddingSpinBox.setValue(option_data.default_style.field_padding)
        # self.ui.emptySetLineEdit.setText(option_data.default_style.empty_set)

    # def enableChange(self, state=True):
        # self.ui.cssSelectorLineEdit.setReadOnly(not state)
        # self.ui.cssSelectorLineEdit.setEnabled(state)
        # self.ui.isRegexCheckBox.setEnabled(state)
        # self.ui.isOpenDelimLineEdit.setReadOnly(not state)
        # self.ui.isOpenDelimLineEdit.setEnabled(state)
        # self.ui.isCloseDelimLineEdit.setReadOnly(not state)
        # self.ui.isCloseDelimLineEdit.setEnabled(state)
        # self.ui.isFieldSeparatorLineEdit.setReadOnly(not state)
        # self.ui.isFieldSeparatorLineEdit.setEnabled(state)

        # # default style
        # self.ui.cssColorsLineEdit.setReadOnly(not state)
        # self.ui.cssColorsLineEdit.setEnabled(state)
        # self.ui.cssColorsRandomStartIndexCheckBox.setEnabled(state)
        # self.ui.cssColorsCollectiveIndexingCheckBox.setEnabled(state)

        # self.ui.htmlClassesLineEdit.setReadOnly(not state)
        # self.ui.htmlClassesLineEdit.setEnabled(state)
        # self.ui.htmlClassesRandomStartIndexCheckBox.setEnabled(state)
        # self.ui.htmlClassesCollectiveIndexingCheckBox.setEnabled(state)

        # self.ui.dsOpenDelimLineEdit.setReadOnly(not state)
        # self.ui.dsOpenDelimLineEdit.setEnabled(state)
        # self.ui.dsCloseDelimLineEdit.setReadOnly(not state)
        # self.ui.dsCloseDelimLineEdit.setEnabled(state)
        # self.ui.dsFieldSeparatorLineEdit.setReadOnly(not state)
        # self.ui.dsFieldSeparatorLineEdit.setEnabled(state)
        # self.ui.fieldPaddingSpinBox.setEnabled(state)
        # self.ui.emptySetLineEdit.setReadOnly(not state)
        # self.ui.emptySetLineEdit.setEnabled(state)

    # def exportData(self):

        # return config.SROption(
        #     config.SRInputSyntax(
        #         self.ui.cssSelectorLineEdit.text(),
        #         self.ui.isOpenDelimLineEdit.text(),
        #         self.ui.isCloseDelimLineEdit.text(),
        #         self.ui.isFieldSeparatorLineEdit.text(),
        #         self.ui.isRegexCheckBox.isChecked(),
        #     ),
        #     config.SRDefaultStyle(
        #         config.SRValues(
        #             list(map(
        #                 lambda v: v.strip(), self.ui.cssColorsLineEdit.text().split(',')
        #             )),
        #             self.ui.cssColorsRandomStartIndexCheckBox.isChecked(),
        #             self.ui.cssColorsCollectiveIndexingCheckBox.isChecked(),
        #         ),

        #         config.SRValues(
        #             list(map(
        #                 lambda v: v.strip(), self.ui.htmlClassesLineEdit.text().split(',')
        #             )),
        #             self.ui.htmlClassesRandomStartIndexCheckBox.isChecked(),
        #             self.ui.htmlClassesCollectiveIndexingCheckBox.isChecked(),
        #         ),

        #         self.ui.fieldPaddingSpinBox.value(),
        #         self.ui.dsFieldSeparatorLineEdit.text(),
        #         self.ui.dsOpenDelimLineEdit.text(),
        #         self.ui.dsCloseDelimLineEdit.text(),
        #         self.ui.emptySetLineEdit.text(),
        #     ),
        # )
