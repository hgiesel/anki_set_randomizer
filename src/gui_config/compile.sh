declare DIR="${BASH_SOURCE%/*}"

rm -f "${DIR}/"*.py

pyuic5 "${DIR}/sr_config.ui"           > "${DIR}/sr_config_ui.py"
pyuic5 "${DIR}/sr_config_tabwidget.ui" > "${DIR}/sr_config_tabwidget_ui.py"

pyuic5 "${DIR}/sr_general_tab.ui"       > "${DIR}/sr_general_tab_ui.py"

pyuic5 "${DIR}/sr_iteration_tab.ui"       > "${DIR}/sr_iteration_tab_ui.py"
pyuic5 "${DIR}/sr_iteration_frontback.ui" > "${DIR}/sr_iteration_frontback_ui.py"
pyuic5 "${DIR}/sr_iteration_config.ui"    > "${DIR}/sr_iteration_config_ui.py"

pyuic5 "${DIR}/sr_injection_tab.ui"    > "${DIR}/sr_injection_tab_ui.py"
pyuic5 "${DIR}/sr_injection_config.ui" > "${DIR}/sr_injection_config_ui.py"

pyuic5 "${DIR}/sr_source_mode_tab.ui"       > "${DIR}/sr_source_mode_tab_ui.py"

pyuic5 "${DIR}/sr_setting_update.ui"      > "${DIR}/sr_setting_update_ui.py"
pyuic5 "${DIR}/sr_setting_add_replace.ui" > "${DIR}/sr_setting_add_replace_ui.py"
