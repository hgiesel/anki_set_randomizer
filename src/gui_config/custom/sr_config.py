import os
import json

from pathlib import Path
from itertools import groupby
from jsonschema import validate, RefResolver, Draft7Validator

from aqt import mw
from aqt.qt import QDialog, QWidget, QAction

from ...lib.config import write_settings, deserialize_setting, serialize_setting
from ...lib.model_editor import setup_models

from ..sr_config_ui import Ui_SRConfig

from .sr_setting_update import SRSettingUpdate
from .sr_config_tabwidget import SRConfigTabwidget

def sort_negative_first(v):
    return abs(int(v.name)) * 2 if int(v.name) < 0 else abs(int(v.name)) * 2 + 1

class SRConfigDialog(QDialog):
    def __init__(self, parent, activate_wb_button):
        super().__init__(parent=parent)

        self.ui = Ui_SRConfig()
        self.ui.setupUi(self)

        self.ui.cancelButton.clicked.connect(self.reject)

        if activate_wb_button:
            self.ui.wbButton.hide()
            self.ui.saveButton.setDefault(True)
            self.ui.saveButton.setAutoDefault(True)

    def setupUi(self, settings, startId=0):
        self.settings = settings

        def saveCurrentSetting(isClicked):
            nonlocal self
            nonlocal settings

            setting_data = self.ui.tabWidget.exportData()
            oldSid = self.ui.modelChooser.findText(setting_data.model_name)
            settings[oldSid] = setting_data

            from aqt.utils import showInfo
            showInfo('srconfig: ' + str(setting_data))

            write_settings(settings)
            self.accept()

        def wbCurrentSetting(isClicked):
            nonlocal self
            nonlocal settings

            setting_data = self.ui.tabWidget.exportData()
            oldSid = self.ui.modelChooser.findText(setting_data.model_name)
            settings[oldSid] = setting_data

            write_settings(settings)
            setup_models(settings)
            self.accept()

        self.ui.saveButton.clicked.connect(saveCurrentSetting)
        self.ui.wbButton.clicked.connect(wbCurrentSetting)

        self.ui.helpButton.clicked.connect(self.showHelp)
        self.ui.aboutButton.clicked.connect(self.showAbout)
        self.ui.importButton.clicked.connect(self.importDialog)

        def updateTabWidgetFromModelchooser(newSid):
            nonlocal self
            nonlocal settings

            setting_data = self.ui.tabWidget.exportData()
            oldSid = self.ui.modelChooser.findText(setting_data.model_name)
            settings[oldSid] = setting_data

            self.updateTabWidget(settings[newSid])

        self.ui.modelChooser.setupUi(
            list(map(
                lambda v: v.model_name,
                settings,
            )),
            updateTabWidgetFromModelchooser,
        )

        self.updateTabWidget(settings[startId])

    def updateTabWidget(self, setting):
        self.ui.tabWidget.setupUi(setting)

    def importDialog(self):
        setting_data = self.ui.tabWidget.exportData()
        old_sid = self.ui.modelChooser.findText(setting_data.model_name)

        def updateAfterImport(new_data):
            nonlocal old_sid
            # name of new_data is not actually used
            self.settings[old_sid] = deserialize_setting(setting_data.model_name, new_data)
            self.updateTabWidget(self.settings[old_sid])

        dirpath = Path(f'{os.path.dirname(os.path.realpath(__file__))}', '../../json_schemas/setting.json')
        schema_path = dirpath.absolute().as_uri()

        with dirpath.open('r') as jsonfile:
            schema = json.load(jsonfile)
            resolver = RefResolver(
                schema_path,
                schema,
            )

            validator = Draft7Validator(schema, resolver=resolver, format_checker=None)

            dial = SRSettingUpdate(mw)
            dial.setupUi(
                json.dumps(serialize_setting(self.settings[old_sid]), sort_keys=True, indent=4),
                validator,
                updateAfterImport,
            )
            dial.exec_()

    def showHelp(self):
        pass
    def showAbout(self):
        pass
