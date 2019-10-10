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
        SRConfig.resize(826, 469)
        self.tabWidgetMain = QtWidgets.QTabWidget(SRConfig)
        self.tabWidgetMain.setGeometry(QtCore.QRect(5, 10, 815, 421))
        self.tabWidgetMain.setDocumentMode(False)
        self.tabWidgetMain.setTabsClosable(False)
        self.tabWidgetMain.setObjectName("tabWidgetMain")
        self.tabSettings = QtWidgets.QWidget()
        self.tabSettings.setObjectName("tabSettings")
        self.cardTypeSelector = QtWidgets.QComboBox(self.tabSettings)
        self.cardTypeSelector.setGeometry(QtCore.QRect(10, 10, 271, 41))
        self.cardTypeSelector.setMaxVisibleItems(10)
        self.cardTypeSelector.setObjectName("cardTypeSelector")
        self.cardTypeSelector.addItem("")
        self.enableCheckBox = QtWidgets.QCheckBox(self.tabSettings)
        self.enableCheckBox.setGeometry(QtCore.QRect(290, 10, 191, 41))
        self.enableCheckBox.setChecked(True)
        self.enableCheckBox.setAutoRepeat(False)
        self.enableCheckBox.setTristate(False)
        self.enableCheckBox.setObjectName("enableCheckBox")
        self.lineTop = QtWidgets.QFrame(self.tabSettings)
        self.lineTop.setGeometry(QtCore.QRect(-70, 50, 1001, 21))
        self.lineTop.setFrameShape(QtWidgets.QFrame.HLine)
        self.lineTop.setFrameShadow(QtWidgets.QFrame.Sunken)
        self.lineTop.setObjectName("lineTop")
        self.iterationTabs = QtWidgets.QTabWidget(self.tabSettings)
        self.iterationTabs.setGeometry(QtCore.QRect(5, 80, 800, 281))
        self.iterationTabs.setTabPosition(QtWidgets.QTabWidget.North)
        self.iterationTabs.setElideMode(QtCore.Qt.ElideLeft)
        self.iterationTabs.setObjectName("iterationTabs")
        self.iterationTab1 = QtWidgets.QWidget()
        self.iterationTab1.setObjectName("iterationTab1")
        self.iterationTabs.addTab(self.iterationTab1, "")
        self.injectAnkiPersistenceCheckBox = QtWidgets.QCheckBox(self.tabSettings)
        self.injectAnkiPersistenceCheckBox.setGeometry(QtCore.QRect(490, 10, 161, 41))
        self.injectAnkiPersistenceCheckBox.setChecked(True)
        self.injectAnkiPersistenceCheckBox.setAutoRepeat(False)
        self.injectAnkiPersistenceCheckBox.setTristate(False)
        self.injectAnkiPersistenceCheckBox.setObjectName("injectAnkiPersistenceCheckBox")
        self.buttonFrame = QtWidgets.QFrame(self.tabSettings)
        self.buttonFrame.setGeometry(QtCore.QRect(400, 360, 401, 31))
        self.buttonFrame.setFrameShape(QtWidgets.QFrame.NoFrame)
        self.buttonFrame.setFrameShadow(QtWidgets.QFrame.Raised)
        self.buttonFrame.setObjectName("buttonFrame")
        self.deleteIterationPushButton = QtWidgets.QPushButton(self.buttonFrame)
        self.deleteIterationPushButton.setGeometry(QtCore.QRect(50, 0, 111, 32))
        self.deleteIterationPushButton.setCheckable(False)
        self.deleteIterationPushButton.setChecked(False)
        self.deleteIterationPushButton.setObjectName("deleteIterationPushButton")
        self.repositionIterationPushButton = QtWidgets.QPushButton(self.buttonFrame)
        self.repositionIterationPushButton.setGeometry(QtCore.QRect(170, 0, 113, 32))
        self.repositionIterationPushButton.setCheckable(False)
        self.repositionIterationPushButton.setChecked(False)
        self.repositionIterationPushButton.setObjectName("repositionIterationPushButton")
        self.duplicateIterationPushButton = QtWidgets.QPushButton(self.buttonFrame)
        self.duplicateIterationPushButton.setGeometry(QtCore.QRect(290, 0, 113, 32))
        self.duplicateIterationPushButton.setCheckable(False)
        self.duplicateIterationPushButton.setChecked(False)
        self.duplicateIterationPushButton.setObjectName("duplicateIterationPushButton")
        self.pasteIntoTemplateCheckBox = QtWidgets.QCheckBox(self.tabSettings)
        self.pasteIntoTemplateCheckBox.setGeometry(QtCore.QRect(660, 10, 141, 41))
        self.pasteIntoTemplateCheckBox.setChecked(True)
        self.pasteIntoTemplateCheckBox.setAutoRepeat(False)
        self.pasteIntoTemplateCheckBox.setTristate(False)
        self.pasteIntoTemplateCheckBox.setObjectName("pasteIntoTemplateCheckBox")
        self.tabWidgetMain.addTab(self.tabSettings, "")
        self.tabAbout = QtWidgets.QWidget()
        self.tabAbout.setObjectName("tabAbout")
        self.aboutText = QtWidgets.QTextBrowser(self.tabAbout)
        self.aboutText.setGeometry(QtCore.QRect(10, 10, 811, 391))
        self.aboutText.setOpenExternalLinks(True)
        self.aboutText.setObjectName("aboutText")
        self.tabWidgetMain.addTab(self.tabAbout, "")
        self.buttonBox = QtWidgets.QDialogButtonBox(SRConfig)
        self.buttonBox.setGeometry(QtCore.QRect(640, 430, 181, 41))
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel|QtWidgets.QDialogButtonBox.Save)
        self.buttonBox.setCenterButtons(False)
        self.buttonBox.setObjectName("buttonBox")

        self.retranslateUi(SRConfig)
        self.tabWidgetMain.setCurrentIndex(0)
        self.iterationTabs.setCurrentIndex(0)
        QtCore.QMetaObject.connectSlotsByName(SRConfig)

    def retranslateUi(self, SRConfig):
        _translate = QtCore.QCoreApplication.translate
        SRConfig.setWindowTitle(_translate("SRConfig", "Set Randomizer Options"))
        self.tabSettings.setWhatsThis(_translate("SRConfig", "<html><head/><body><p><br/></p></body></html>"))
        self.cardTypeSelector.setToolTip(_translate("SRConfig", "<html><head/><body><p>Select the CardType for which you want to change the SR settings.</p></body></html>"))
        self.cardTypeSelector.setItemText(0, _translate("SRConfig", "CardType"))
        self.enableCheckBox.setToolTip(_translate("SRConfig", "<html><head/><body><p>Check this if you want to SR for this card type. Uncheck this option for all card types, before you decide to uninstall SR.</p></body></html>"))
        self.enableCheckBox.setText(_translate("SRConfig", "Enable Set Randomizer (SR)"))
        self.iterationTabs.setTabText(self.iterationTabs.indexOf(self.iterationTab1), _translate("SRConfig", "Iteration XXX"))
        self.injectAnkiPersistenceCheckBox.setToolTip(_translate("SRConfig", "<html><head/><body><p>Advanced. Inject anki-persistence. You should only uncheck this, if you already use anki-persistence in your templates, and you don\'t want to include it twice. </p></body></html>"))
        self.injectAnkiPersistenceCheckBox.setText(_translate("SRConfig", "Inject anki-persistence"))
        self.deleteIterationPushButton.setText(_translate("SRConfig", "Delete"))
        self.repositionIterationPushButton.setText(_translate("SRConfig", "Reposition"))
        self.duplicateIterationPushButton.setText(_translate("SRConfig", "Duplicate"))
        self.pasteIntoTemplateCheckBox.setToolTip(_translate("SRConfig", "<html><head/><body><p>Check this if you want to paste the SR code directly into the template. This is recommended.</p><p>If you uncheck this, SR will create a file in your media folder containing the code. However this option is slower, and you might notice lag. If you can live with this lag, uncheck.</p></body></html>"))
        self.pasteIntoTemplateCheckBox.setText(_translate("SRConfig", "Paste into template"))
        self.tabWidgetMain.setTabText(self.tabWidgetMain.indexOf(self.tabSettings), _translate("SRConfig", "Settings"))
        self.aboutText.setHtml(_translate("SRConfig", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:\'.AppleSystemUIFont\'; font-size:13pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:12px; margin-bottom:12px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:\'.SF NS Text\'; font-weight:600;\">Anki Set Randomizer</span><span style=\" font-family:\'.SF NS Text\';\"> was developed by </span><a href=\"https://github.com/hgiesel\"><span style=\" font-family:\'.SF NS Text\'; text-decoration: underline; color:#0000ff;\">Henrik Giesel (hgiesel)</span></a><span style=\" font-family:\'.SF NS Text\';\">. <br />🐇 If you like my work consider supporting me on </span><a href=\"https://ko-fi.com/hgiesel\"><span style=\" font-family:\'.SF NS Text\'; text-decoration: underline; color:#0000ff;\">Ko-Fi</span></a><span style=\" font-family:\'.SF NS Text\';\">. 🐇</span></p>\n"
"<p style=\" margin-top:12px; margin-bottom:12px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:\'.SF NS Text\'; font-weight:600;\">Anki Persistence</span><span style=\" font-family:\'.SF NS Text\';\"> was developed by </span><a href=\"https://github.com/SimonLammer/anki-persistence\"><span style=\" font-family:\'.SF NS Text\'; text-decoration: underline; color:#0000ff;\">Simmon Lammer</span></a><span style=\" font-family:\'.SF NS Text\';\">.<br /></span></p>\n"
"<p style=\" margin-top:12px; margin-bottom:12px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:\'.SF NS Text\';\">For more information about how to use Set Randomizer, you should check out </span><a href=\"https://hgiesel.github.io/anki-set-randomizer/\"><span style=\" font-family:\'.SF NS Text\'; text-decoration: underline; color:#0000ff;\">the docs</span></a><span style=\" font-family:\'.SF NS Text\';\"> (work in progress).</span></p>\n"
"<p style=\" margin-top:12px; margin-bottom:12px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:\'.SF NS Text\';\">Thanks to reddit user u/im__aarkay for testing v2.0 on AnkiDroid.</span></p></body></html>"))
        self.tabWidgetMain.setTabText(self.tabWidgetMain.indexOf(self.tabAbout), _translate("SRConfig", "About"))
