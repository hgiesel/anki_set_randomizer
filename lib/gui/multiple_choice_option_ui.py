# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'multiple_choice_option.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_MultipleChoiceOptionDialog(object):
    def setupUi(self, MultipleChoiceOptionDialog):
        MultipleChoiceOptionDialog.setObjectName("MultipleChoiceOptionDialog")
        MultipleChoiceOptionDialog.resize(607, 407)
        self.buttonBox = QtWidgets.QDialogButtonBox(MultipleChoiceOptionDialog)
        self.buttonBox.setGeometry(QtCore.QRect(350, 350, 221, 41))
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName("buttonBox")
        self.fieldPaddingSpinBox = QtWidgets.QSpinBox(MultipleChoiceOptionDialog)
        self.fieldPaddingSpinBox.setGeometry(QtCore.QRect(150, 270, 71, 21))
        self.fieldPaddingSpinBox.setObjectName("fieldPaddingSpinBox")
        self.fieldPaddingLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.fieldPaddingLabel.setGeometry(QtCore.QRect(40, 270, 101, 21))
        self.fieldPaddingLabel.setObjectName("fieldPaddingLabel")
        self.openDelimLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.openDelimLabel.setGeometry(QtCore.QRect(40, 230, 101, 21))
        self.openDelimLabel.setObjectName("openDelimLabel")
        self.closeDelimLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.closeDelimLabel.setGeometry(QtCore.QRect(380, 230, 101, 21))
        self.closeDelimLabel.setObjectName("closeDelimLabel")
        self.openDelimLineEdit = QtWidgets.QLineEdit(MultipleChoiceOptionDialog)
        self.openDelimLineEdit.setGeometry(QtCore.QRect(150, 230, 71, 21))
        self.openDelimLineEdit.setObjectName("openDelimLineEdit")
        self.closeDelimLineEdit = QtWidgets.QLineEdit(MultipleChoiceOptionDialog)
        self.closeDelimLineEdit.setGeometry(QtCore.QRect(490, 230, 71, 21))
        self.closeDelimLineEdit.setObjectName("closeDelimLineEdit")
        self.fieldSeparatorLineEdit = QtWidgets.QLineEdit(MultipleChoiceOptionDialog)
        self.fieldSeparatorLineEdit.setGeometry(QtCore.QRect(490, 270, 71, 21))
        self.fieldSeparatorLineEdit.setObjectName("fieldSeparatorLineEdit")
        self.fieldSeparatorLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.fieldSeparatorLabel.setGeometry(QtCore.QRect(380, 270, 101, 21))
        self.fieldSeparatorLabel.setObjectName("fieldSeparatorLabel")
        self.cardTypeSelector = QtWidgets.QComboBox(MultipleChoiceOptionDialog)
        self.cardTypeSelector.setGeometry(QtCore.QRect(30, 20, 231, 41))
        self.cardTypeSelector.setMaxVisibleItems(10)
        self.cardTypeSelector.setObjectName("cardTypeSelector")
        self.cardTypeSelector.addItem("")
        self.cssQueryLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.cssQueryLabel.setGeometry(QtCore.QRect(40, 150, 81, 16))
        self.cssQueryLabel.setObjectName("cssQueryLabel")
        self.cssQueryLineEdit = QtWidgets.QLineEdit(MultipleChoiceOptionDialog)
        self.cssQueryLineEdit.setEnabled(False)
        self.cssQueryLineEdit.setGeometry(QtCore.QRect(170, 150, 241, 21))
        self.cssQueryLineEdit.setObjectName("cssQueryLineEdit")
        self.cssColorsLabel = QtWidgets.QLabel(MultipleChoiceOptionDialog)
        self.cssColorsLabel.setGeometry(QtCore.QRect(40, 190, 81, 16))
        self.cssColorsLabel.setObjectName("cssColorsLabel")
        self.cssColorsLineEdit = QtWidgets.QLineEdit(MultipleChoiceOptionDialog)
        self.cssColorsLineEdit.setGeometry(QtCore.QRect(170, 190, 391, 21))
        self.cssColorsLineEdit.setObjectName("cssColorsLineEdit")
        self.enableCheckBox = QtWidgets.QCheckBox(MultipleChoiceOptionDialog)
        self.enableCheckBox.setGeometry(QtCore.QRect(30, 60, 171, 41))
        self.enableCheckBox.setToolTip("")
        self.enableCheckBox.setChecked(True)
        self.enableCheckBox.setAutoRepeat(False)
        self.enableCheckBox.setTristate(False)
        self.enableCheckBox.setObjectName("enableCheckBox")
        self.lineTop = QtWidgets.QFrame(MultipleChoiceOptionDialog)
        self.lineTop.setGeometry(QtCore.QRect(-10, 101, 761, 21))
        self.lineTop.setFrameShape(QtWidgets.QFrame.HLine)
        self.lineTop.setFrameShadow(QtWidgets.QFrame.Sunken)
        self.lineTop.setObjectName("lineTop")
        self.lineBottom = QtWidgets.QFrame(MultipleChoiceOptionDialog)
        self.lineBottom.setGeometry(QtCore.QRect(-70, 311, 821, 20))
        self.lineBottom.setFrameShape(QtWidgets.QFrame.HLine)
        self.lineBottom.setFrameShadow(QtWidgets.QFrame.Sunken)
        self.lineBottom.setObjectName("lineBottom")
        self.autoGenerateCheckBox = QtWidgets.QCheckBox(MultipleChoiceOptionDialog)
        self.autoGenerateCheckBox.setGeometry(QtCore.QRect(440, 150, 121, 20))
        self.autoGenerateCheckBox.setObjectName("autoGenerateCheckBox")
        self.textBrowser = QtWidgets.QTextBrowser(MultipleChoiceOptionDialog)
        self.textBrowser.setGeometry(QtCore.QRect(40, 340, 341, 51))
        self.textBrowser.setObjectName("textBrowser")

        self.retranslateUi(MultipleChoiceOptionDialog)
        self.buttonBox.accepted.connect(MultipleChoiceOptionDialog.accept)
        self.buttonBox.rejected.connect(MultipleChoiceOptionDialog.reject)
        QtCore.QMetaObject.connectSlotsByName(MultipleChoiceOptionDialog)

    def retranslateUi(self, MultipleChoiceOptionDialog):
        _translate = QtCore.QCoreApplication.translate
        MultipleChoiceOptionDialog.setWindowTitle(_translate("MultipleChoiceOptionDialog", "Dialog"))
        self.fieldPaddingSpinBox.setSuffix(_translate("MultipleChoiceOptionDialog", "px"))
        self.fieldPaddingLabel.setText(_translate("MultipleChoiceOptionDialog", "Field Padding"))
        self.openDelimLabel.setText(_translate("MultipleChoiceOptionDialog", "Open Delimiter"))
        self.closeDelimLabel.setText(_translate("MultipleChoiceOptionDialog", "Close Delimiter"))
        self.openDelimLineEdit.setText(_translate("MultipleChoiceOptionDialog", "(("))
        self.closeDelimLineEdit.setText(_translate("MultipleChoiceOptionDialog", "))"))
        self.fieldSeparatorLineEdit.setText(_translate("MultipleChoiceOptionDialog", "::"))
        self.fieldSeparatorLabel.setText(_translate("MultipleChoiceOptionDialog", "Field Separator"))
        self.cardTypeSelector.setItemText(0, _translate("MultipleChoiceOptionDialog", "CardType"))
        self.cssQueryLabel.setToolTip(_translate("MultipleChoiceOptionDialog", "<html><head/><body><p>A CSS query to select the elements which contain all Multiple Choices.</p></body></html>"))
        self.cssQueryLabel.setText(_translate("MultipleChoiceOptionDialog", "CSS Query"))
        self.cssColorsLabel.setToolTip(_translate("MultipleChoiceOptionDialog", "<html><head/><body><p>A list of CSS colors. The first field will be displayed with the first color. Colors will be repeated, if fields exceed colors.</p></body></html>"))
        self.cssColorsLabel.setText(_translate("MultipleChoiceOptionDialog", "CSS Colors"))
        self.cssColorsLineEdit.setText(_translate("MultipleChoiceOptionDialog", "[]"))
        self.enableCheckBox.setText(_translate("MultipleChoiceOptionDialog", "Enable Multiple Choice"))
        self.autoGenerateCheckBox.setText(_translate("MultipleChoiceOptionDialog", "Auto Generate"))
        self.textBrowser.setHtml(_translate("MultipleChoiceOptionDialog", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:\'.SF NS Text\'; font-size:13pt; font-weight:400; font-style:normal;\">\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:12pt;\">anki-persistence was developed by Simon Lammer</span></p>\n"
"<p align=\"center\" style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-size:12pt;\">anki-multiple-choice was developed by Henrik Giesel</span></p></body></html>"))
