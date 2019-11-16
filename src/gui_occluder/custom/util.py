import enum
from aqt.qt import Qt

class Handle(enum.Enum):
    TopLeft = 1
    TopMiddle = 2
    TopRight = 3
    MiddleLeft = 4
    MiddleRight = 5
    BottomLeft = 6
    BottomMiddle = 7
    BottomRight = 8

handleSize = +8.0
handleSpace = -4.0
handleCursors = {
    Handle.TopLeft: Qt.SizeFDiagCursor,
    Handle.TopMiddle: Qt.SizeVerCursor,
    Handle.TopRight: Qt.SizeBDiagCursor,
    Handle.MiddleLeft: Qt.SizeHorCursor,
    Handle.MiddleRight: Qt.SizeHorCursor,
    Handle.BottomLeft: Qt.SizeBDiagCursor,
    Handle.BottomMiddle: Qt.SizeVerCursor,
    Handle.BottomRight: Qt.SizeFDiagCursor,
}
