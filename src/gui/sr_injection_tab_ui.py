# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_injection_tab.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SRInjectionTab(object):
    def setupUi(self, SRInjectionTab):
        SRInjectionTab.setObjectName("SRInjectionTab")
        SRInjectionTab.resize(792, 252)
        self.inputSyntax = QtWidgets.QGroupBox(SRInjectionTab)
        self.inputSyntax.setGeometry(QtCore.QRect(10, 60, 301, 181))
        self.inputSyntax.setObjectName("inputSyntax")
        self.plainTextEdit = QtWidgets.QPlainTextEdit(self.inputSyntax)
        self.plainTextEdit.setGeometry(QtCore.QRect(10, 30, 281, 141))
        self.plainTextEdit.setObjectName("plainTextEdit")
        self.defaultSyntax = QtWidgets.QGroupBox(SRInjectionTab)
        self.defaultSyntax.setGeometry(QtCore.QRect(320, 0, 461, 241))
        self.defaultSyntax.setObjectName("defaultSyntax")
        self.listWidget = QtWidgets.QListWidget(self.defaultSyntax)
        self.listWidget.setGeometry(QtCore.QRect(10, 30, 441, 201))
        self.listWidget.setDragEnabled(True)
        self.listWidget.setDragDropMode(QtWidgets.QAbstractItemView.InternalMove)
        self.listWidget.setAlternatingRowColors(True)
        self.listWidget.setSelectionMode(QtWidgets.QAbstractItemView.ExtendedSelection)
        self.listWidget.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectItems)
        self.listWidget.setProperty("isWrapping", True)
        self.listWidget.setResizeMode(QtWidgets.QListView.Fixed)
        self.listWidget.setSelectionRectVisible(True)
        self.listWidget.setObjectName("listWidget")
        item = QtWidgets.QListWidgetItem()
        self.listWidget.addItem(item)
        item = QtWidgets.QListWidgetItem()
        item.setFlags(QtCore.Qt.ItemIsSelectable|QtCore.Qt.ItemIsEditable|QtCore.Qt.ItemIsDragEnabled|QtCore.Qt.ItemIsDropEnabled|QtCore.Qt.ItemIsUserCheckable|QtCore.Qt.ItemIsEnabled)
        self.listWidget.addItem(item)
        item = QtWidgets.QListWidgetItem()
        self.listWidget.addItem(item)
        self.generalOptions = QtWidgets.QGroupBox(SRInjectionTab)
        self.generalOptions.setGeometry(QtCore.QRect(10, 0, 301, 61))
        self.generalOptions.setObjectName("generalOptions")
        self.enableIterationCheckBox = QtWidgets.QCheckBox(self.generalOptions)
        self.enableIterationCheckBox.setGeometry(QtCore.QRect(10, 30, 251, 20))
        self.enableIterationCheckBox.setObjectName("enableIterationCheckBox")

        self.retranslateUi(SRInjectionTab)
        QtCore.QMetaObject.connectSlotsByName(SRInjectionTab)

    def retranslateUi(self, SRInjectionTab):
        _translate = QtCore.QCoreApplication.translate
        SRInjectionTab.setWindowTitle(_translate("SRInjectionTab", "Form"))
        self.inputSyntax.setToolTip(_translate("SRInjectionTab", "<html><head/><body><p>The input syntax of the iteration. This will be used to detect sets in the card content.</p></body></html>"))
        self.inputSyntax.setTitle(_translate("SRInjectionTab", "Injection Conditions"))
        self.plainTextEdit.setPlainText(_translate("SRInjectionTab", "[\'&\',\n"
" [\'card\', \'includes\', \'FrontBack\'],\n"
" [\'|\', [\'tag\', \'endsWith\', \'context\'], [\'tag\', \'endsWith\', \'xxx\']]]"))
        self.defaultSyntax.setToolTip(_translate("SRInjectionTab", "<html><head/><body><p>Every iteration has a default style with the name &quot;default&quot;. If no other style is applied, and no rule is applicable, the &quot;default&quot; style will be used.</p></body></html>"))
        self.defaultSyntax.setTitle(_translate("SRInjectionTab", "Statements To Inject"))
        self.listWidget.setSortingEnabled(True)
        __sortingEnabled = self.listWidget.isSortingEnabled()
        self.listWidget.setSortingEnabled(False)
        item = self.listWidget.item(0)
        item.setText(_translate("SRInjectionTab", "$eval(tone)"))
        item = self.listWidget.item(1)
        item.setText(_translate("SRInjectionTab", "$rule(tone, tone)"))
        item = self.listWidget.item(2)
        item.setText(_translate("SRInjectionTab", "$style(tone, clrs:[pink], fltr:yes)"))
        self.listWidget.setSortingEnabled(__sortingEnabled)
        self.generalOptions.setToolTip(_translate("SRInjectionTab", "<html><head/><body><p>The input syntax of the iteration. This will be used to detect sets in the card content.</p></body></html>"))
        self.generalOptions.setTitle(_translate("SRInjectionTab", "General"))
        self.enableIterationCheckBox.setToolTip(_translate("SRInjectionTab", "<html><head/><body><p>Advanced feature. Check this if you want to treat the content of the &quot;Open Delimiter&quot;, &quot;Close Delimiter&quot;, and &quot;Field separator&quot; as regular expressions.</p></body></html>"))
        self.enableIterationCheckBox.setText(_translate("SRInjectionTab", "Enable this injection"))
