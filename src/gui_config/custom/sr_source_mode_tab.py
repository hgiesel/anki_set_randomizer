from aqt.qt import QWidget

from ...lib.config import deserialize_source_mode, deserialize_cloze_options, deserialize_occlusion_options
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
        self.ui.clozeOpenDelimLineEdit.setText(cloze_options.open_delim)
        self.ui.clozeCloseDelimLineEdit.setText(cloze_options.close_delim)

    def exportClozeOptions(self):
        return deserialize_cloze_options({
            'shortcutsEnabled': self.ui.clozeShortcutsEnabledCheckBox.isChecked(),
            'vsPrefix': self.ui.clozeVsPrefixLineEdit.text(),
            'openDelim': self.ui.clozeOpenDelimLineEdit.text(),
            'closeDelim': self.ui.clozeCloseDelimLineEdit.text(),
        })

    def exportOcclusionOptions(self):
        return deserialize_occlusion_options({})

    def exportData(self):
        return deserialize_source_mode({
            'clozeOptions': self.exportClozeOptions(),
            'occlusionOptions': self.exportOcclusionOptions(),
        })
