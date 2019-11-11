from aqt.qt import QDialog, QWidget, QAction
from aqt.utils import showInfo

from itertools import groupby

from ...lib.config_types import SRValues, SRDefaultStyle, SRInputSyntax, SRIteration

from ..sr_iteration_config_ui import Ui_SRIterationConfig

from .util import mapTruthValueToIcon

class SRIterationConfig(QWidget):

    def __init__(self):
        super().__init__()

        self.ui = Ui_SRIterationConfig()
        self.ui.setupUi(self)

        self.ui.enableIterationCheckBox.stateChanged.connect(self.enableChangeGui)

    def setupUi(self, iteration):
        self.name = iteration.name
        self.ui.enableIterationCheckBox.setChecked(iteration.enabled)

        ins = iteration.input_syntax
        self.setupIs(ins)

        ds = iteration.default_style
        self.setupDs(ds)

    def setupIs(self, ins):
        self.ui.cssSelectorLineEdit.setText(ins.css_selector)
        self.ui.isRegexCheckBox.setChecked(ins.is_regex)
        self.ui.isOpenDelimLineEdit.setText(ins.open_delim)
        self.ui.isCloseDelimLineEdit.setText(ins.close_delim)
        self.ui.isFieldSeparatorLineEdit.setText(ins.field_separator)

    def setupDs(self, ds):
        self.ui.cssColorsLineEdit.setText(', '.join(ds.colors.values))
        self.ui.cssColorsRandomStartIndexCheckBox.setChecked(ds.colors.random_start_index)
        self.ui.cssColorsCollectiveIndexingCheckBox.setChecked(ds.colors.collective_indexing)

        self.ui.htmlClassesLineEdit.setText(', '.join(ds.classes.values))
        self.ui.htmlClassesRandomStartIndexCheckBox.setChecked(ds.classes.random_start_index)
        self.ui.htmlClassesCollectiveIndexingCheckBox.setChecked(ds.classes.collective_indexing)

        self.ui.dsOpenDelimLineEdit.setText(ds.open_delim)
        self.ui.dsCloseDelimLineEdit.setText(ds.close_delim)
        self.ui.dsFieldSeparatorLineEdit.setText(ds.field_separator)
        self.ui.fieldPaddingSpinBox.setValue(ds.field_padding)
        self.ui.emptySetLineEdit.setText(ds.empty_set)

        self.ui.strokeLineEdit.setText(ds.stroke),
        self.ui.strokeOpacitySpinBox.setValue(ds.stroke_opacity),
        self.ui.strokeWidthSpinBox.setValue(ds.stroke_width),

        self.ui.fillLineEdit.setText(ds.fill),
        self.ui.fillOpacitySpinBox.setValue(ds.fill_opacity),

    def enableChangeGui(self):
        self.enableChange(self.ui.enableIterationCheckBox.isChecked())

    def enableChange(self, state=True):
        # input syntax
        self.ui.cssSelectorLineEdit.setReadOnly(not state)
        self.ui.cssSelectorLineEdit.setEnabled(state)
        self.ui.isRegexCheckBox.setEnabled(state)
        self.ui.isOpenDelimLineEdit.setReadOnly(not state)
        self.ui.isOpenDelimLineEdit.setEnabled(state)
        self.ui.isCloseDelimLineEdit.setReadOnly(not state)
        self.ui.isCloseDelimLineEdit.setEnabled(state)
        self.ui.isFieldSeparatorLineEdit.setReadOnly(not state)
        self.ui.isFieldSeparatorLineEdit.setEnabled(state)

        # default style
        self.ui.cssColorsLineEdit.setReadOnly(not state)
        self.ui.cssColorsLineEdit.setEnabled(state)
        self.ui.cssColorsRandomStartIndexCheckBox.setEnabled(state)
        self.ui.cssColorsCollectiveIndexingCheckBox.setEnabled(state)

        self.ui.htmlClassesLineEdit.setReadOnly(not state)
        self.ui.htmlClassesLineEdit.setEnabled(state)
        self.ui.htmlClassesRandomStartIndexCheckBox.setEnabled(state)
        self.ui.htmlClassesCollectiveIndexingCheckBox.setEnabled(state)

        self.ui.dsOpenDelimLineEdit.setReadOnly(not state)
        self.ui.dsOpenDelimLineEdit.setEnabled(state)
        self.ui.dsCloseDelimLineEdit.setReadOnly(not state)
        self.ui.dsCloseDelimLineEdit.setEnabled(state)
        self.ui.dsFieldSeparatorLineEdit.setReadOnly(not state)
        self.ui.dsFieldSeparatorLineEdit.setEnabled(state)
        self.ui.fieldPaddingSpinBox.setEnabled(state)
        self.ui.emptySetLineEdit.setReadOnly(not state)
        self.ui.emptySetLineEdit.setEnabled(state)

    def updateName(self, newName):
        self.name = newName

    def exportIs(self):
        return SRInputSyntax(
            self.ui.cssSelectorLineEdit.text(),
            self.ui.isOpenDelimLineEdit.text(),
            self.ui.isCloseDelimLineEdit.text(),
            self.ui.isFieldSeparatorLineEdit.text(),
            self.ui.isRegexCheckBox.isChecked(),
        )

    def exportDs(self):
        return SRDefaultStyle(
            SRValues(
                [v.strip() for v in self.ui.cssColorsLineEdit.text().split(',')],
                self.ui.cssColorsRandomStartIndexCheckBox.isChecked(),
                self.ui.cssColorsCollectiveIndexingCheckBox.isChecked(),
            ),

            SRValues(
                [v.strip() for v in self.ui.htmlClassesLineEdit.text().split(',')],
                self.ui.htmlClassesRandomStartIndexCheckBox.isChecked(),
                self.ui.htmlClassesCollectiveIndexingCheckBox.isChecked(),
            ),

            self.ui.fieldPaddingSpinBox.value(),
            self.ui.dsFieldSeparatorLineEdit.text(),
            self.ui.dsOpenDelimLineEdit.text(),
            self.ui.dsCloseDelimLineEdit.text(),
            self.ui.emptySetLineEdit.text(),

            self.ui.strokeLineEdit.text(),
            self.ui.strokeOpacitySpinBox.value(),
            self.ui.strokeWidthSpinBox.value(),

            self.ui.fillLineEdit.text(),
            self.ui.fillOpacitySpinBox.value(),
        )

    def exportData(self):
        return SRIteration(
            self.name,
            self.ui.enableIterationCheckBox.isChecked(),
            self.exportIs(),
            self.exportDs(),
        )
