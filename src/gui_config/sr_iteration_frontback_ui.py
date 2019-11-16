# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_iteration_frontback.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRIterationFrontback(object):
    def setupUi(self, SRIterationFrontback):
        SRIterationFrontback.setObjectName("SRIterationFrontback")
        SRIterationFrontback.resize(829, 303)
        self.gridLayout = QtWidgets.QGridLayout(SRIterationFrontback)
        self.gridLayout.setObjectName("gridLayout")
        self.tabWidget = QtWidgets.QTabWidget(SRIterationFrontback)
        self.tabWidget.setTabPosition(QtWidgets.QTabWidget.North)
        self.tabWidget.setTabShape(QtWidgets.QTabWidget.Rounded)
        self.tabWidget.setObjectName("tabWidget")
        self.frontside = SRIterationConfig()
        self.frontside.setObjectName("frontside")
        self.tabWidget.addTab(self.frontside, "Frontside -")
        self.backside = SRIterationConfig()
        self.backside.setObjectName("backside")
        self.tabWidget.addTab(self.backside, "")
        self.gridLayout.addWidget(self.tabWidget, 2, 0, 1, 12)
        self.iterationNameLabel = QtWidgets.QLabel(SRIterationFrontback)
        self.iterationNameLabel.setObjectName("iterationNameLabel")
        self.gridLayout.addWidget(self.iterationNameLabel, 0, 0, 1, 1)
        self.cancelButton = QtWidgets.QPushButton(SRIterationFrontback)
        self.cancelButton.setObjectName("cancelButton")
        self.gridLayout.addWidget(self.cancelButton, 5, 10, 1, 1)
        self.saveButton = QtWidgets.QPushButton(SRIterationFrontback)
        self.saveButton.setAutoDefault(True)
        self.saveButton.setObjectName("saveButton")
        self.gridLayout.addWidget(self.saveButton, 5, 11, 1, 1)
        self.copyIsToOtherSideButton = QtWidgets.QPushButton(SRIterationFrontback)
        self.copyIsToOtherSideButton.setObjectName("copyIsToOtherSideButton")
        self.gridLayout.addWidget(self.copyIsToOtherSideButton, 0, 9, 1, 1)
        self.copyDsToOtherSideButton = QtWidgets.QPushButton(SRIterationFrontback)
        self.copyDsToOtherSideButton.setObjectName("copyDsToOtherSideButton")
        self.gridLayout.addWidget(self.copyDsToOtherSideButton, 0, 10, 1, 2)
        self.importButton = QtWidgets.QPushButton(SRIterationFrontback)
        self.importButton.setObjectName("importButton")
        self.gridLayout.addWidget(self.importButton, 5, 0, 1, 1)
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.gridLayout.addItem(spacerItem, 5, 1, 1, 9)
        self.iterationNameLineEdit = QtWidgets.QLineEdit(SRIterationFrontback)
        self.iterationNameLineEdit.setObjectName("iterationNameLineEdit")
        self.gridLayout.addWidget(self.iterationNameLineEdit, 0, 1, 1, 3)

        self.retranslateUi(SRIterationFrontback)
        self.tabWidget.setCurrentIndex(0)
        QtCore.QMetaObject.connectSlotsByName(SRIterationFrontback)

    def retranslateUi(self, SRIterationFrontback):
        _translate = QtCore.QCoreApplication.translate
        SRIterationFrontback.setWindowTitle(_translate("SRIterationFrontback", "Form"))
        self.tabWidget.setTabText(self.tabWidget.indexOf(self.backside), _translate("SRIterationFrontback", "+ Backside"))
        self.iterationNameLabel.setText(_translate("SRIterationFrontback", "Iteration Name:"))
        self.cancelButton.setText(_translate("SRIterationFrontback", "Cancel"))
        self.saveButton.setText(_translate("SRIterationFrontback", "Save"))
        self.copyIsToOtherSideButton.setText(_translate("SRIterationFrontback", "Copy Input Syntax To Other Side"))
        self.copyDsToOtherSideButton.setText(_translate("SRIterationFrontback", "Copy Default Style To Other Side"))
        self.importButton.setText(_translate("SRIterationFrontback", "Import / Export"))
from anki_set_randomizer.src.gui_config.custom.sr_iteration_config import SRIterationConfig
