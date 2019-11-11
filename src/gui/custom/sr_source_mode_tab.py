from aqt.qt import QWidget, QAction
from ...lib import config
from ...lib.config_types import SRSourceMode, SRClozeOptions, SROcclusionOptions

from ..sr_source_mode_tab_ui import Ui_SRSourceModeTab

class SRSourceModeTab(QWidget):
    def __init__(self):
        super().__init__()

        self.ui = Ui_SRSourceModeTab()
        self.ui.setupUi(self)

    def setupUi(self, source_mode):
        cloze_options = source_mode.cloze_options

        self.ui.clozeShortcutsEnabledCheckBox.setChecked(cloze_options.shortcuts_enabled)
        self.ui.clozeVsPrefixLineEdit.setText(cloze_options.vs_prefix)
        self.ui.clozeOpenDelimLineEdit.setText(cloze_options.close_delim)
        self.ui.clozeCloseDelimLineEdit.setText(cloze_options.open_delim)

    def exportData(self):
        return SRSourceMode(
            SRClozeOptions(
                self.ui.clozeShortcutsEnabledCheckBox.isChecked(),
                self.ui.clozeVsPrefixLineEdit.text(),
                self.ui.clozeOpenDelimLineEdit.text(),
                self.ui.clozeCloseDelimLineEdit.text(),
            ),
            SROcclusionOptions(),
        )
