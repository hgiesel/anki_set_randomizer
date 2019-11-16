import os
import json

from jsonschema import validate, RefResolver, Draft7Validator
from itertools import groupby

from aqt import mw
from aqt.qt import QDialog, QWidget, QAction

from .sr_setting_update import SRSettingUpdate

from ..sr_iteration_config_ui import Ui_SRIterationConfig

from ...lib.config import deserialize_default_style, deserialize_input_syntax, deserialize_iteration, serialize_iteration

from .util import mapTruthValueToIcon

class SRIterationConfig(QWidget):
    def __init__(self):
        super().__init__()

        self.ui = Ui_SRIterationConfig()
        self.ui.setupUi(self)

        self.ui.enableIterationCheckBox.stateChanged.connect(self.enableChangeGui)
        self.ui.importButton.clicked.connect(self.importDialog)

    def setupUi(self, iteration):
        self.name = iteration.name
        self.ui.descriptionTextEdit.setPlainText(iteration.description)
        self.ui.enableIterationCheckBox.setChecked(iteration.enabled)

        ins = iteration.input_syntax
        self.setupIs(ins)

        ds = iteration.default_style
        self.setupDs(ds)

        self.enableChangeGui()

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
        self.ui.cssColorsDelimLineEdit.setText(ds.colors.delim)

        self.ui.htmlClassesLineEdit.setText(', '.join(ds.classes.values))
        self.ui.htmlClassesRandomStartIndexCheckBox.setChecked(ds.classes.random_start_index)
        self.ui.htmlClassesCollectiveIndexingCheckBox.setChecked(ds.classes.collective_indexing)
        self.ui.htmlClassesDelimLineEdit.setText(ds.classes.delim)

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
        self.ui.cssColorsDelimLineEdit.setReadOnly(not state)
        self.ui.cssColorsDelimLineEdit.setEnabled(state)
        self.ui.cssColorsRandomStartIndexCheckBox.setEnabled(state)
        self.ui.cssColorsCollectiveIndexingCheckBox.setEnabled(state)

        self.ui.htmlClassesLineEdit.setReadOnly(not state)
        self.ui.htmlClassesLineEdit.setEnabled(state)
        self.ui.htmlClassesDelimLineEdit.setReadOnly(not state)
        self.ui.htmlClassesDelimLineEdit.setEnabled(state)
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

        self.ui.strokeLineEdit.setReadOnly(not state)
        self.ui.strokeLineEdit.setEnabled(state)
        self.ui.strokeOpacitySpinBox.setEnabled(state)
        self.ui.strokeWidthSpinBox.setEnabled(state)

        self.ui.fillLineEdit.setReadOnly(not state)
        self.ui.fillLineEdit.setEnabled(state)
        self.ui.fillOpacitySpinBox.setEnabled(state)

    def updateName(self, newName):
        self.name = newName

    def exportIs(self):
        return deserialize_input_syntax({
            'cssSelector': self.ui.cssSelectorLineEdit.text(),
            'openDelim': self.ui.isOpenDelimLineEdit.text(),
            'closeDelim': self.ui.isCloseDelimLineEdit.text(),
            'fieldSeparator': self.ui.isFieldSeparatorLineEdit.text(),
            'isRegex': self.ui.isRegexCheckBox.isChecked(),
        })

    def exportColors(self):
            return {
                'values': [v.strip() for v in self.ui.cssColorsLineEdit.text().split(',')],
                'delim': self.ui.cssColorsDelimLineEdit.text(),
                'randomStartIndex': self.ui.cssColorsRandomStartIndexCheckBox.isChecked(),
                'collectiveIndexing': self.ui.cssColorsCollectiveIndexingCheckBox.isChecked(),
            }

    def exportClasses(self):
            return {
                'values': [v.strip() for v in self.ui.htmlClassesLineEdit.text().split(',')],
                'delim': self.ui.htmlClassesDelimLineEdit.text(),
                'randomStartIndex': self.ui.htmlClassesRandomStartIndexCheckBox.isChecked(),
                'collectiveIndexing': self.ui.htmlClassesCollectiveIndexingCheckBox.isChecked(),
            }

    def exportDs(self):
        return deserialize_default_style({
            'colors': self.exportColors(),
            'classes': self.exportClasses(),

            'fieldPadding': self.ui.fieldPaddingSpinBox.value(),
            'fieldSeparator': self.ui.dsFieldSeparatorLineEdit.text(),
            'openDelim': self.ui.dsOpenDelimLineEdit.text(),
            'closeDelim': self.ui.dsCloseDelimLineEdit.text(),
            'emptySet': self.ui.emptySetLineEdit.text(),

            'stroke': self.ui.strokeLineEdit.text(),
            'strokeOpacity': self.ui.strokeOpacitySpinBox.value(),
            'strokeWidth': self.ui.strokeWidthSpinBox.value(),

            'fill': self.ui.fillLineEdit.text(),
            'fillOpacity': self.ui.fillOpacitySpinBox.value(),
        })

    def exportData(self):
        return deserialize_iteration({
            'name': self.name,
            'description': self.ui.descriptionTextEdit.toPlainText(),
            'enabled': self.ui.enableIterationCheckBox.isChecked(),
            'inputSyntax': self.exportIs(),
            'defaultStyle': self.exportDs(),
        })

    def importDialog(self):
        def updateAfterImport(new_iteration):
            self.setupUi(deserialize_iteration(new_iteration))

        dirpath = f'{os.path.dirname(os.path.realpath(__file__))}/../../json_schemas/iter.json'
        schema_path = f'file:{dirpath}'

        with open(dirpath, 'r') as jsonfile:
            schema = json.load(jsonfile)
            resolver = RefResolver(
                schema_path,
                schema,
            )

            validator = Draft7Validator(schema, resolver=resolver, format_checker=None)

            dial = SRSettingUpdate(mw)
            dial.setupUi(
                json.dumps(serialize_iteration(self.exportData()), sort_keys=True, indent=4),
                validator,
                updateAfterImport,
            )
            dial.exec_()
