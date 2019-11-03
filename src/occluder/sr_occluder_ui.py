# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file './sr_occluder.ui'
#
# Created by: PyQt5 UI code generator 5.13.0
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_SROccluder(object):
    def setupUi(self, SROccluder):
        SROccluder.setObjectName("SROccluder")
        SROccluder.resize(713, 343)
        self.layoutWidget = QtWidgets.QWidget(SROccluder)
        self.layoutWidget.setGeometry(QtCore.QRect(20, 20, 681, 311))
        self.layoutWidget.setObjectName("layoutWidget")
        self.horizontalLayout = QtWidgets.QHBoxLayout(self.layoutWidget)
        self.horizontalLayout.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.widget = QtWidgets.QWidget(self.layoutWidget)
        self.widget.setObjectName("widget")
        self.verticalLayout = QtWidgets.QVBoxLayout(self.widget)
        self.verticalLayout.setObjectName("verticalLayout")
        self.toolButton = QtWidgets.QToolButton(self.widget)
        self.toolButton.setObjectName("toolButton")
        self.verticalLayout.addWidget(self.toolButton)
        self.toolButton_4 = QtWidgets.QToolButton(self.widget)
        self.toolButton_4.setObjectName("toolButton_4")
        self.verticalLayout.addWidget(self.toolButton_4)
        self.toolButton_2 = QtWidgets.QToolButton(self.widget)
        self.toolButton_2.setObjectName("toolButton_2")
        self.verticalLayout.addWidget(self.toolButton_2)
        self.toolButton_5 = QtWidgets.QToolButton(self.widget)
        self.toolButton_5.setObjectName("toolButton_5")
        self.verticalLayout.addWidget(self.toolButton_5)
        self.toolButton_3 = QtWidgets.QToolButton(self.widget)
        self.toolButton_3.setObjectName("toolButton_3")
        self.verticalLayout.addWidget(self.toolButton_3)
        self.toolButton_6 = QtWidgets.QToolButton(self.widget)
        self.toolButton_6.setObjectName("toolButton_6")
        self.verticalLayout.addWidget(self.toolButton_6)
        self.horizontalLayout.addWidget(self.widget)
        self.graphicsView = QtWidgets.QGraphicsView(self.layoutWidget)
        self.graphicsView.setObjectName("graphicsView")
        self.horizontalLayout.addWidget(self.graphicsView)

        self.retranslateUi(SROccluder)
        QtCore.QMetaObject.connectSlotsByName(SROccluder)

    def retranslateUi(self, SROccluder):
        _translate = QtCore.QCoreApplication.translate
        SROccluder.setWindowTitle(_translate("SROccluder", "Form"))
        self.toolButton.setText(_translate("SROccluder", "RECT"))
        self.toolButton_4.setText(_translate("SROccluder", "LINE"))
        self.toolButton_2.setText(_translate("SROccluder", "ELLI"))
        self.toolButton_5.setText(_translate("SROccluder", "ARR"))
        self.toolButton_3.setText(_translate("SROccluder", "POLY"))
        self.toolButton_6.setText(_translate("SROccluder", "DARR"))
