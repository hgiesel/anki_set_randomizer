from ..lib.config import write_config_data
from ..lib.model_editor import setup_models

from aqt.qt import QDialog, QWidget, QAction
from aqt.utils import getText, showWarning, showInfo
from anki.hooks import addHook

from .sr_config_ui import Ui_SRConfig
from .sr_option_tab import SROptionTab

from ..lib.config import SRSetting
from ..lib.config import SROption

def write_data_back(config_data):
    write_config_data(config_data)
    setup_models(config_data)

class SRConfigDialog(QDialog):

    first_init = False

    def __init__(self, mw, config_data):
        super().__init__(parent=mw)

        self.config_data = config_data

        self.ui = Ui_SRConfig()
        self.ui.setupUi(self)

        self.setupUi()
        self.setFixedSize(self.size())

    def setupUi(self):
        self.ui.buttonBox.accepted.connect(self.onAccept)
        self.ui.buttonBox.rejected.connect(self.onReject)

        self.ui.repositionIterationPushButton.pressed.connect(self.repositionIteration)
        self.ui.duplicateIterationPushButton.pressed.connect(self.duplicateIteration)
        self.ui.deleteIterationPushButton.pressed.connect(self.deleteIteration)

        self.ui.cardTypeSelector.removeItem(0)

        self.ui.cardTypeSelector.addItems(list(map(
            lambda v: v.model_name,
            self.config_data,
        )))

        self.previous_index = 0

        self.initGuiWithSetting()
        self.enableStateChanged()

        self.ui.enableCheckBox.stateChanged.connect(self.enableStateChanged)
        self.ui.cardTypeSelector.currentIndexChanged.connect(self.cardTypeSelectorChanged)

    def cardTypeSelectorChanged(self, setting_idx=0):
        self.saveSRSettingFromGui()
        self.initGuiWithSetting(setting_idx)
        self.enableStateChanged()

    ### write to self.config_data
    # input syntax + default style
    def getSROption(self):
        return [option.exportData() for option in [self.ui.iterationTabs.widget(i) for i in range(self.ui.iterationTabs.count())]]

    ### write to self.config_data from Gui
    def saveSRSettingFromGui(self):

        self.config_data[self.previous_index] = SRSetting(
            self.ui.cardTypeSelector.itemText(self.previous_index),
            self.ui.enableCheckBox.isChecked(),
            self.ui.injectAnkiPersistenceCheckBox.isChecked(),
            self.ui.pasteIntoTemplateCheckBox.isChecked(),
            self.getSROption()
        )

        self.previous_index = self.ui.cardTypeSelector.currentIndex()

    def initGuiWithSetting(self, setting_idx=0, option_idx=0):
        setting_current = self.config_data[setting_idx]

        self.ui.enableCheckBox.setChecked(setting_current.enabled)
        self.ui.injectAnkiPersistenceCheckBox.setChecked(setting_current.inject_anki_persistence)
        self.ui.pasteIntoTemplateCheckBox.setChecked(setting_current.paste_into_template)

        self.ui.iterationTabs.clear()

        current_index = 1
        for option in setting_current.options:
            self.ui.iterationTabs.addTab(SROptionTab(self.ui.iterationTabs, option), 'Iteration ' + str(current_index))
            current_index += 1

        self.ui.iterationTabs.setCurrentIndex(option_idx)

    def reindexGui(self):
        for i in range(self.ui.iterationTabs.count()):
            self.ui.iterationTabs.setTabText(i, 'Iteration ' + str(i + 1))

    def enableStateChanged(self):

        if self.ui.enableCheckBox.isChecked():
            for option in [self.ui.iterationTabs.widget(i)
                           for i in range(self.ui.iterationTabs.count())]:
                option.enableChange(True)

            self.ui.repositionIterationPushButton.setEnabled(True)
            self.ui.duplicateIterationPushButton.setEnabled(True)
            self.ui.deleteIterationPushButton.setEnabled(True)

        else:
            for option in [self.ui.iterationTabs.widget(i)
                           for i in range(self.ui.iterationTabs.count())]:
                option.enableChange(False)

            self.ui.repositionIterationPushButton.setEnabled(False)
            self.ui.duplicateIterationPushButton.setEnabled(False)
            self.ui.deleteIterationPushButton.setEnabled(False)

    # iteration buttons
    def deleteIteration(self):
        if self.ui.iterationTabs.count() != 1:
            self.ui.iterationTabs.removeTab(self.ui.iterationTabs.currentIndex())
            self.saveSRSettingFromGui()
            self.reindexGui()
        else:
            showWarning('Cannot delete the last iteration')

    def repositionIteration(self):
        new_position, ok = getText(f'Enter a new position (1..{self.ui.iterationTabs.count()})')

        if new_position is not '' and ok is 1:
            try:
                new_pos = int(new_position) - 1

                if new_pos < 0:
                    raise 'Too small'
                elif new_pos >= self.ui.iterationTabs.count():
                    raise 'Too big'

                else:
                    save_widget = self.ui.iterationTabs.currentWidget()
                    self.ui.iterationTabs.removeTab(self.ui.iterationTabs.currentIndex())
                    self.ui.iterationTabs.insertTab(new_pos, save_widget, 'Iteration XXX')

                    self.ui.iterationTabs.setCurrentWidget(save_widget)
                    self.saveSRSettingFromGui()
                    self.reindexGui()

            except:
                showWarning('Illegal value')


    def duplicateIteration(self):
        option_data = SROption._make(self.ui.iterationTabs.currentWidget().exportData())
        self.ui.iterationTabs.addTab(
            SROptionTab(self.ui.iterationTabs, option_data),
            'Iteration ' + str(self.ui.iterationTabs.count() + 1),
        )

        self.saveSRSettingFromGui()

    # close dialog
    def onAccept(self):
        # write back info
        self.saveSRSettingFromGui()
        write_data_back(self.config_data)

        self.onReject()

    def onReject(self):
        self.close()
