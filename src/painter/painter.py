import sys

from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtGui import QPainter, QBrush, QPen
from PyQt5.QtCore import Qt, QRect, QSize

class Window(QMainWindow):

    def __init__(self):

        super().__init__()
        self.title = "PyQt5 Drawing Tutorial"
        self.top= 150
        self.left= 150
        self.width = 500
        self.height = 500
        self.InitWindow()

    def InitWindow(self):

        self.setWindowTitle(self.title)
        self.setGeometry(self.top, self.left, self.width, self.height)
        self.show()

    def paintEvent(self, event):
        painter = QPainter(self)
        # pic = QPixmap("name.png")
        # painter.drawPixmap(self.rect(), pic)
        gen = QSvgGenerator()
        gen.setFineName('foo.svg')
        gen.setSize(QSize(200,200))
        gen.setViewBox(QRect(0,0,200,200))
        gen.setTitle('Hello, world')
        gen.setDescription('abc')

        painter.begin(gen)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setPen(QPen(Qt.green, 8, Qt.DashLine))
        painter.setBrush(QBrush(Qt.red, Qt.CrossPattern))

        # painter.drawEllipse(40, 40, 400, 400)
        painter.drawRect(40, 40, 400, 200)

App = QApplication(sys.argv)
window = Window()
sys.exit(App.exec())
