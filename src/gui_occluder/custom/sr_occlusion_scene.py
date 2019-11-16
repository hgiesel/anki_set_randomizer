import os
from aqt.qt import QGraphicsScene, QPixmap, QRectF

class SROcclusionScene(QGraphicsScene):
    def __init__(self, parent, bg=None):
        super().__init__(parent=parent)
        self.bg = bg
        self.bgSet = False

    def drawBackground(self, painter, rect):
        super().drawBackground(painter, rect)

        pic_path = f'{os.path.dirname(os.path.realpath(__file__))}/{self.bg}'
        pic = QPixmap(pic_path)
        self.setSceneRect(QRectF(pic.rect()))

        painter.drawPixmap(self.sceneRect().toRect(), pic, pic.rect())
        self.bgSet = True
