import os
import enum

from aqt.qt import QDialog, QGraphicsScene, QGraphicsRectItem, QGraphicsEllipseItem, QApplication
from aqt.qt import Qt, QPen, QGraphicsItem, QPixmap, QRectF, QPainter
from aqt.qt import QPointF, QBrush, QColor, QPainterPath, QIcon, QSize, QPalette

from aqt.utils import showInfo

from ..sr_occluder_ui import Ui_SROccluder

from .sr_rect import SRRect
from .sr_occlusion_view.py import SROcclusionView
from .sr_occlusion_scene.py import SROcclusionScene

class ToolMode(enum.Enum):
   Select = 1
   Move = 2
   Zoom = 3

   Rect = 4
   Ellipse = 5
   Polygon = 6
   Line = 7
   Arrow = 8
   Darrow = 9
   Text = 10

class SROccluder(QDialog):
    def __init__(self, parent):
        super().__init__(parent=parent)

        self.ui = Ui_SROccluder()
        self.ui.setupUi(self)

        self.toolMode = ToolMode.Select
        self.setupButtons()

    def setupButtons(self):
        main_path = f'{os.path.dirname(os.path.realpath(__file__))}/../icons'

        self.ui.selectButton.setIcon(QIcon(f"{main_path}/select.png"))
        self.ui.moveButton.setIcon(QIcon(f"{main_path}/move.png"))
        self.ui.zoomButton.setIcon(QIcon(f"{main_path}/zoom.png"))

        self.ui.rectButton.setIcon(QIcon(f"{main_path}/rect.png"))
        self.ui.ellipseButton.setIcon(QIcon(f"{main_path}/ellipse.png"))
        self.ui.polygonButton.setIcon(QIcon(f"{main_path}/polygon.png"))
        self.ui.lineButton.setIcon(QIcon(f"{main_path}/line.png"))
        self.ui.arrowButton.setIcon(QIcon(f"{main_path}/arrow.png"))
        self.ui.darrowButton.setIcon(QIcon(f"{main_path}/darrow.png"))
        self.ui.textButton.setIcon(QIcon(f"{main_path}/text.png"))

        self.ui.selectButton.clicked.connect(self.selectTool)
        self.ui.moveButton.clicked.connect(self.moveTool)
        self.ui.zoomButton.clicked.connect(self.zoomTool)

        self.ui.rectButton.clicked.connect(self.rectTool)
        self.ui.ellipseButton.clicked.connect(self.ellipseTool)
        self.ui.polygonButton.clicked.connect(self.polygonTool)
        self.ui.lineButton.clicked.connect(self.lineTool)
        self.ui.arrowButton.clicked.connect(self.arrowTool)
        self.ui.darrowButton.clicked.connect(self.darrowTool)
        self.ui.textButton.clicked.connect(self.textTool)

    def selectTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Select)

    def moveTool(self):
        QApplication.setOverrideCursor(Qt.SizeAllCursor)
        self.changeMode(ToolMode.Move)

    def zoomTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Zoom)

    def rectTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Rect)

    def ellipseTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Ellipse)

    def polygonTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Polygon)

    def lineTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Line)

    def arrowTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Arrow)

    def darrowTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Darrow)

    def textTool(self):
        QApplication.setOverrideCursor(Qt.ArrowCursor)
        self.changeMode(ToolMode.Text)

    def changeMode(self, mode):
        self.resetButton(mode, True)
        self.resetButton(self.toolMode, False)
        self.toolMode = mode

    def resetButton(self, mode, state):
        if mode == ToolMode.Select:
            self.ui.selectButton.setChecked(state)
            self.ui.selectButton.repaint()
        elif mode == ToolMode.Move:
            self.ui.moveButton.setChecked(state)
            self.ui.moveButton.repaint()
        elif mode == ToolMode.Zoom:
            self.ui.zoomButton.setChecked(state)
            self.ui.zoomButton.repaint()

        elif mode == ToolMode.Rect:
            self.ui.rectButton.setChecked(state)
            self.ui.rectButton.repaint()
        elif mode == ToolMode.Ellipse:
            self.ui.ellipseButton.setChecked(state)
            self.ui.ellipseButton.repaint()
        elif mode == ToolMode.Polygon:
            self.ui.polygonButton.setChecked(state)
            self.ui.polygonButton.repaint()
        elif mode == ToolMode.Line:
            self.ui.lineButton.setChecked(state)
            self.ui.lineButton.repaint()
        elif mode == ToolMode.Arrow:
            self.ui.arrowButton.setChecked(state)
            self.ui.arrowButton.repaint()
        elif mode == ToolMode.Darrow:
            self.ui.darrowButton.setChecked(state)
            self.ui.darrowButton.repaint()
        elif mode == ToolMode.Text:
            self.ui.textButton.setChecked(state)
            self.ui.textButton.repaint()

    def setupUi(self):
        theScene = SROcclusionScene(self, 'skull.jpg')
        self.ui.graphicsView.setScene(theScene)

        outlinePen = QPen()

        rect = theScene.addRect(10, 10, 50, 50, outlinePen, Qt.green)
        rect.setFlag(QGraphicsItem.ItemIsMovable)
        rect.setFlag(QGraphicsItem.ItemIsSelectable)
        rect.setFlag(QGraphicsItem.ItemIsFocusable)

        rect2 = SRRect(0, 0, 50, 30)
        rect2.setFlag(QGraphicsItem.ItemIsMovable)
        rect2.setFlag(QGraphicsItem.ItemIsSelectable)

        theScene.addItem(rect2)
