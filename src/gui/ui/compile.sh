declare DIR="${BASH_SOURCE%/*}"

rm -f "${DIR}/"*.py

pyuic5 "${DIR}/sr_config.ui" > "${DIR}/sr_config_ui.py"

pyuic5 "${DIR}/sr_frontback_container.ui" > "${DIR}/sr_frontback_container_ui.py"
pyuic5 "${DIR}/sr_iteration_tab.ui"       > "${DIR}/sr_iteration_tab_ui.py"

pyuic5 "${DIR}/sr_injection_tab.ui" > "${DIR}/sr_injection_tab_ui.py"
