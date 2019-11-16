# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_setting_add_replace.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRSettingAddReplace(object):
    def setupUi(self, SRSettingAddReplace):
        SRSettingAddReplace.setObjectName("SRSettingAddReplace")
        SRSettingAddReplace.resize(641, 489)
        self.verticalLayout = QtWidgets.QVBoxLayout(SRSettingAddReplace)
        self.verticalLayout.setObjectName("verticalLayout")
        self.textEdit = QtWidgets.QPlainTextEdit(SRSettingAddReplace)
        self.textEdit.setObjectName("textEdit")
        self.verticalLayout.addWidget(self.textEdit)
        self.widget = QtWidgets.QWidget(SRSettingAddReplace)
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
        self.replaceButton = QtWidgets.QPushButton(self.widget)
        self.replaceButton.setObjectName("replaceButton")
        self.horizontalLayout.addWidget(self.replaceButton)
        self.addButton = QtWidgets.QPushButton(self.widget)
        self.addButton.setObjectName("addButton")
        self.horizontalLayout.addWidget(self.addButton)
        self.verticalLayout.addWidget(self.widget)

        self.retranslateUi(SRSettingAddReplace)
        QtCore.QMetaObject.connectSlotsByName(SRSettingAddReplace)

    def retranslateUi(self, SRSettingAddReplace):
        _translate = QtCore.QCoreApplication.translate
        SRSettingAddReplace.setWindowTitle(_translate("SRSettingAddReplace", "Add / Replace Dialog"))
        self.validateButton.setText(_translate("SRSettingAddReplace", "Validate"))
        self.cancelButton.setText(_translate("SRSettingAddReplace", "Cancel"))
        self.replaceButton.setText(_translate("SRSettingAddReplace", "Replace"))
        self.addButton.setText(_translate("SRSettingAddReplace", "Add"))
