# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_config_tabwidget.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRConfigTabwidget(object):
    def setupUi(self, SRConfigTabwidget):
        SRConfigTabwidget.setObjectName("SRConfigTabwidget")
        SRConfigTabwidget.resize(419, 246)
        self.generalTab = SRGeneralTab()
        self.generalTab.setObjectName("generalTab")
        SRConfigTabwidget.addTab(self.generalTab, "")
        self.iterationTab = SRIterationTab()
        self.iterationTab.setObjectName("iterationTab")
        SRConfigTabwidget.addTab(self.iterationTab, "")
        self.injectionTab = SRInjectionTab()
        self.injectionTab.setObjectName("injectionTab")
        SRConfigTabwidget.addTab(self.injectionTab, "")
        self.sourceModeTab = SRSourceModeTab()
        self.sourceModeTab.setObjectName("sourceModeTab")
        SRConfigTabwidget.addTab(self.sourceModeTab, "")

        self.retranslateUi(SRConfigTabwidget)
        SRConfigTabwidget.setCurrentIndex(3)
        QtCore.QMetaObject.connectSlotsByName(SRConfigTabwidget)

    def retranslateUi(self, SRConfigTabwidget):
        _translate = QtCore.QCoreApplication.translate
        SRConfigTabwidget.setWindowTitle(_translate("SRConfigTabwidget", "TabWidget"))
        SRConfigTabwidget.setTabText(SRConfigTabwidget.indexOf(self.generalTab), _translate("SRConfigTabwidget", "General"))
        SRConfigTabwidget.setTabText(SRConfigTabwidget.indexOf(self.iterationTab), _translate("SRConfigTabwidget", "Iterations"))
        SRConfigTabwidget.setTabText(SRConfigTabwidget.indexOf(self.injectionTab), _translate("SRConfigTabwidget", "Injections"))
        SRConfigTabwidget.setTabText(SRConfigTabwidget.indexOf(self.sourceModeTab), _translate("SRConfigTabwidget", "Source Mode"))
from anki_set_randomizer.src.gui_config.custom.sr_general_tab import SRGeneralTab
from anki_set_randomizer.src.gui_config.custom.sr_injection_tab import SRInjectionTab
from anki_set_randomizer.src.gui_config.custom.sr_iteration_tab import SRIterationTab
from anki_set_randomizer.src.gui_config.custom.sr_source_mode_tab import SRSourceModeTab
