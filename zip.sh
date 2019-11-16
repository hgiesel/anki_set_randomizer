declare DIR=${BASH_SOURCE%/*}
rm "${DIR}/set_randomizer.ankiaddon"

if [[ "$1" == '-l' ]]; then
  # for uploading to AnkiWeb
  declare addon_id='1164532380'
else
  # for installing myself
  declare addon_id='set_randomizer'
fi

zip -r "${DIR}/set_randomizer.ankiaddon" \
  "${DIR}/__init__.py" \
  "${DIR}/src/"*".py" \
  "${DIR}/src/lib/"*".py" \
  "${DIR}/src/gui_config/"*".py" \
  "${DIR}/src/gui_config/custom/"*".py" \
  "${DIR}/src/gui_config/icons/"* \
  "${DIR}/src/json_schemas/"* \
  "${DIR}/js/dist/"{front,back,anki-persistence}".js" \
  "${DIR}/config."{json,md} "${DIR}/manifest.json"
