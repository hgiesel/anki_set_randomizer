# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_setting_update.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRSettingUpdate(object):
    def setupUi(self, SRSettingUpdate):
        SRSettingUpdate.setObjectName("SRSettingUpdate")
        SRSettingUpdate.resize(637, 478)
        self.verticalLayout = QtWidgets.QVBoxLayout(SRSettingUpdate)
        self.verticalLayout.setObjectName("verticalLayout")
        self.textEdit = QtWidgets.QPlainTextEdit(SRSettingUpdate)
        self.textEdit.setObjectName("textEdit")
        self.verticalLayout.addWidget(self.textEdit)
        self.widget = QtWidgets.QWidget(SRSettingUpdate)
        self.widget.setObjectName("widget")
        self.horizontalLayout = QtWidgets.QHBoxLayout(self.widget)
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.validateButton = QtWidgets.QPushButton(self.widget)
        self.validateButton.setObjectName("validateButton")
        self.horizontalLayout.addWidget(self.validateButton)
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.horizontalLayout.addItem(spacerItem)
        self.cancelButton = QtWidgets.QPushButton(self.widget)
        self.cancelButton.setObjectName("cancelButton")
        self.horizontalLayout.addWidget(self.cancelButton)
        self.updateButton = QtWidgets.QPushButton(self.widget)
        self.updateButton.setObjectName("updateButton")
        self.horizontalLayout.addWidget(self.updateButton)
        self.verticalLayout.addWidget(self.widget)

        self.retranslateUi(SRSettingUpdate)
        QtCore.QMetaObject.connectSlotsByName(SRSettingUpdate)

    def retranslateUi(self, SRSettingUpdate):
        _translate = QtCore.QCoreApplication.translate
        SRSettingUpdate.setWindowTitle(_translate("SRSettingUpdate", "Update Dialog"))
        self.validateButton.setText(_translate("SRSettingUpdate", "Validate"))
        self.cancelButton.setText(_translate("SRSettingUpdate", "Cancel"))
        self.updateButton.setText(_translate("SRSettingUpdate", "Update"))
