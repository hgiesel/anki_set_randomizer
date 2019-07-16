

def setupSettings(obj):
    logger.debug('Triggered MultipleChoice Options!')

    # obj.multChoiceMw.showNormal()
    # obj.multChoiceMw.raise_()
    # obj.multChoiceMw.activateWindow()


def setupMenuOption():
    action = QAction('Multiple Choice Options...', mw)
    action.triggered.connect(setupSettings)
    mw.form.menuTools.addAction(action)
