import sys

from aqt.qt import *
from aqt import mw

from .gui import multiple_choice_option_ui

class MultipleChoiceOptions(QDialog):
    """Global options dialog"""

    def __init__(self, mw):
        super().__init__(parent=mw)

        self.f = multiple_choice_option_ui.Ui_MultipleChoiceOptionDialog()
        self.f.setupUi(self)
        # self.setupUI()

        # # load qt-designer form:
        # self.f = settings_global.Ui_Dialog()
        # self.f.setupUi(self)
        # self.setupUI()
        # self.fndict = list(zip((i for i in OLC_FIDS_PRIV if i != "tx"),
        #     [self.f.le_og, self.f.le_st, self.f.le_fl]))
        # self.fsched = (self.f.cb_ns_new, self.f.cb_ns_rev, self.f.cb_sfc)
        # self.fopts = (self.f.cb_ncf, self.f.cb_ncl,
        #               self.f.cb_incr, self.f.cb_gfc)
        # self.setupValues(config["synced"])

#     def setupUI(self):
#         self.f.buttonBox.accepted.connect(self.onAccept)
#         self.f.buttonBox.rejected.connect(self.onReject)
#         self.f.buttonBox.button(
#             QDialogButtonBox.RestoreDefaults).clicked.connect(self.onRestore)
#         about_string = get_about_string()
#         self.f.htmlAbout.setHtml(about_string)

#     def setupValues(self, values):
#         """Set widget values"""
#         before, prompt, after = values["dflts"]
#         before = before if before is not None else -1
#         after = after if after is not None else -1
#         self.f.sb_before.setValue(before)
#         self.f.sb_after.setValue(after)
#         self.f.sb_cloze.setValue(prompt)
#         self.f.le_model.setText(",".join(values["olmdls"]))
#         for idx, cb in enumerate(self.fsched):
#             cb.setChecked(values["sched"][idx])
#         for idx, cb in enumerate(self.fopts):
#             cb.setChecked(values["dflto"][idx])
#         for key, fnedit in self.fndict:
#             fnedit.setText(values["flds"][key])

#     def onAccept(self):
#         reset_req = False
#         try:
#             reset_req = self.renameFields()
#         except AnkiError:  # rejected full sync warning
#             return
#         before = self.f.sb_before.value()
#         after = self.f.sb_after.value()
#         prompt = self.f.sb_cloze.value()
#         before = before if before != -1 else None
#         after = after if after != -1 else None
#         config["synced"]['dflts'] = [before, prompt, after]
#         config["synced"]['sched'] = [i.isChecked() for i in self.fsched]
#         config["synced"]["dflto"] = [i.isChecked() for i in self.fopts]
#         config["synced"]["olmdls"] = self.f.le_model.text().split(",")
#         config.save(reset=reset_req)
#         self.close()

#     def onRestore(self):
#         self.setupValues(config.defaults["synced"])
#         for key, lnedit in self.fndict:
#             lnedit.setModified(True)

#     def onReject(self):
#         self.close()

#     def renameFields(self):
#         """Check for modified names and rename fields accordingly"""
#         modified = False
#         model = mw.col.models.byName(OLC_MODEL)
#         flds = model['flds']
#         for key, fnedit in self.fndict:
#             if not fnedit.isModified():
#                 continue
#             name = fnedit.text()
#             oldname = config["synced"]['flds'][key]
#             if name is None or not name.strip() or name == oldname:
#                 continue
#             idx = mw.col.models.fieldNames(model).index(oldname)
#             fld = flds[idx]
#             if fld:
#                 # rename note type fields
#                 mw.col.models.renameField(model, fld, name)
#                 # update olcloze field-id <-> field-name assignment
#                 config["synced"]['flds'][key] = name
#                 modified = True
#         return modified



def invoke_options():
    """Invoke global config dialog"""
    dialog = MultipleChoiceOptions(mw)
    return dialog.exec_()

def setup_menu_option():
    mult_choice = QAction('Multiple Choice Options...', mw)
    mult_choice.triggered.connect(invoke_options)
    mw.form.menuTools.addAction(mult_choice)

setup_menu_option()
