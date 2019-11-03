from aqt.qt import QDialog, QGraphicsScene, QGraphicsRectItem, QGraphicsEllipseItem, Qt, QPen, QGraphicsItem

from ..sr_occluder_ui import Ui_SROccluder

class SROccluder(QDialog):

    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SROccluder()
        self.ui.setupUi(self)

    def setupUi(self):

        theScene = QGraphicsScene(self)
        self.ui.graphicsView.setScene(theScene)

        outlinePen = QPen()

        rect = theScene.addRect(10, 10, 50, 50, outlinePen, Qt.green)
        rect.setFlag(QGraphicsItem.ItemIsMovable)
