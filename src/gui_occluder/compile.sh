declare DIR="${BASH_SOURCE%/*}"

rm -f "${DIR}/"*.py

pyuic5 "${DIR}/sr_occluder.ui" > "${DIR}/sr_occluder_ui.py"
