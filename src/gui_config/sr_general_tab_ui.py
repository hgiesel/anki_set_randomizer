# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_general_tab.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRGeneralTab(object):
    def setupUi(self, SRGeneralTab):
        SRGeneralTab.setObjectName("SRGeneralTab")
        SRGeneralTab.resize(645, 224)
        self.gridLayout_2 = QtWidgets.QGridLayout(SRGeneralTab)
        self.gridLayout_2.setObjectName("gridLayout_2")
        spacerItem = QtWidgets.QSpacerItem(40, 20, QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Minimum)
        self.gridLayout_2.addItem(spacerItem, 0, 2, 8, 1)
        self.insertAnkiPersistenceCheckBox = QtWidgets.QCheckBox(SRGeneralTab)
        self.insertAnkiPersistenceCheckBox.setObjectName("insertAnkiPersistenceCheckBox")
        self.gridLayout_2.addWidget(self.insertAnkiPersistenceCheckBox, 4, 0, 1, 2)
        self.enableCheckBox = QtWidgets.QCheckBox(SRGeneralTab)
        self.enableCheckBox.setObjectName("enableCheckBox")
        self.gridLayout_2.addWidget(self.enableCheckBox, 3, 0, 1, 2)
        spacerItem1 = QtWidgets.QSpacerItem(20, 40, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        self.gridLayout_2.addItem(spacerItem1, 7, 0, 1, 2)
        self.nameLabel = QtWidgets.QLabel(SRGeneralTab)
        self.nameLabel.setObjectName("nameLabel")
        self.gridLayout_2.addWidget(self.nameLabel, 0, 0, 1, 1)
        self.pasteIntoCardTemplateCheckBox = QtWidgets.QCheckBox(SRGeneralTab)
        self.pasteIntoCardTemplateCheckBox.setObjectName("pasteIntoCardTemplateCheckBox")
        self.gridLayout_2.addWidget(self.pasteIntoCardTemplateCheckBox, 5, 0, 1, 2)
        self.nameLineEdit = QtWidgets.QLineEdit(SRGeneralTab)
        self.nameLineEdit.setReadOnly(True)
        self.nameLineEdit.setObjectName("nameLineEdit")
        self.gridLayout_2.addWidget(self.nameLineEdit, 0, 1, 1, 1)
        self.descriptionTextEdit = QtWidgets.QPlainTextEdit(SRGeneralTab)
        self.descriptionTextEdit.setObjectName("descriptionTextEdit")
        self.gridLayout_2.addWidget(self.descriptionTextEdit, 1, 0, 1, 2)

        self.retranslateUi(SRGeneralTab)
        QtCore.QMetaObject.connectSlotsByName(SRGeneralTab)

    def retranslateUi(self, SRGeneralTab):
        _translate = QtCore.QCoreApplication.translate
        SRGeneralTab.setWindowTitle(_translate("SRGeneralTab", "Form"))
        self.insertAnkiPersistenceCheckBox.setText(_translate("SRGeneralTab", "Insert Anki Persistence"))
        self.enableCheckBox.setToolTip(_translate("SRGeneralTab", "<html><head/><body><p>Advanced feature. Check this if you want to treat the content of the &quot;Open Delimiter&quot;, &quot;Close Delimiter&quot;, and &quot;Field separator&quot; as regular expressions.</p></body></html>"))
        self.enableCheckBox.setText(_translate("SRGeneralTab", "Enable Set Randomizer (SR)"))
        self.nameLabel.setText(_translate("SRGeneralTab", "Model Name:"))
        self.pasteIntoCardTemplateCheckBox.setText(_translate("SRGeneralTab", "Paste into Card Template"))
        self.nameLineEdit.setText(_translate("SRGeneralTab", "the model name"))
        self.descriptionTextEdit.setPlaceholderText(_translate("SRGeneralTab", "Description"))
