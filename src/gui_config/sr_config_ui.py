# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_config.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRConfig(object):
    def setupUi(self, SRConfig):
        SRConfig.setObjectName("SRConfig")
        SRConfig.resize(1089, 446)
        self.gridLayout = QtWidgets.QGridLayout(SRConfig)
        self.gridLayout.setObjectName("gridLayout")
        self.cancelButton = QtWidgets.QPushButton(SRConfig)
        self.cancelButton.setAutoDefault(False)
        self.cancelButton.setObjectName("cancelButton")
        self.gridLayout.addWidget(self.cancelButton, 2, 7, 1, 1)
        self.saveButton = QtWidgets.QPushButton(SRConfig)
        self.saveButton.setObjectName("saveButton")
        self.gridLayout.addWidget(self.saveButton, 2, 8, 1, 1)
        self.pushButton = QtWidgets.QPushButton(SRConfig)
        self.pushButton.setObjectName("pushButton")
        self.gridLayout.addWidget(self.pushButton, 0, 6, 1, 1)
        self.modelChooser = SRConfigModelchooser(SRConfig)
        self.modelChooser.setObjectName("modelChooser")
        self.gridLayout.addWidget(self.modelChooser, 0, 2, 1, 4)
        self.helpButton = QtWidgets.QPushButton(SRConfig)
        self.helpButton.setAutoDefault(False)
        self.helpButton.setObjectName("helpButton")
        self.gridLayout.addWidget(self.helpButton, 2, 0, 1, 1)
        self.tabWidget = SRConfigTabwidget(SRConfig)
        self.tabWidget.setObjectName("tabWidget")
        self.gridLayout.addWidget(self.tabWidget, 1, 0, 1, 9)
        self.aboutButton = QtWidgets.QPushButton(SRConfig)
        self.aboutButton.setAutoDefault(False)
        self.aboutButton.setObjectName("aboutButton")
        self.gridLayout.addWidget(self.aboutButton, 2, 1, 1, 1)
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.gridLayout.addItem(spacerItem, 2, 2, 1, 5)

        self.retranslateUi(SRConfig)
        self.tabWidget.setCurrentIndex(-1)
        QtCore.QMetaObject.connectSlotsByName(SRConfig)

    def retranslateUi(self, SRConfig):
        _translate = QtCore.QCoreApplication.translate
        SRConfig.setWindowTitle(_translate("SRConfig", "Set Randomizer Settings"))
        self.cancelButton.setText(_translate("SRConfig", "Cancel"))
        self.saveButton.setText(_translate("SRConfig", "Save"))
        self.pushButton.setText(_translate("SRConfig", "Import / Export Setting"))
        self.helpButton.setText(_translate("SRConfig", "Help"))
        self.aboutButton.setText(_translate("SRConfig", "About"))
from anki_set_randomizer.src.gui_config.custom.sr_config_modelchooser import SRConfigModelchooser
from anki_set_randomizer.src.gui_config.custom.sr_config_tabwidget import SRConfigTabwidget
