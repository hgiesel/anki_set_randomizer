declare DIR=${BASH_SOURCE%/*}

npm run --prefix "${DIR}/js" build

if [[ "$1" == '-a' ]]; then
  # for uploading to AnkiWeb
  declare addon_id='1164532380'
else
  # for installing myself
  declare addon_id='set_randomizer'
fi

rm -f "${DIR}/${addon_id}.ankiaddon"
sed -i "s/anki_set_randomizer.src.gui_config//" "${DIR}/src/gui_config/"*".py"

zip -r "${DIR}/${addon_id}.ankiaddon" \
  "${DIR}/__init__.py" \
  "${DIR}/src/"*".py" \
  "${DIR}/src/lib/"*".py" \
  "${DIR}/src/gui_config/"*".py" \
  "${DIR}/src/gui_config/custom/"*".py" \
  "${DIR}/src/gui_config/icons/"* \
  "${DIR}/src/json_schemas/"* \
  "${DIR}/js/dist/"{front,back,anki-persistence}".js" \
  "${DIR}/config."{json,md} "${DIR}/manifest.json"

sed -i "s/.custom/anki_set_randomizer.src.gui_config.custom/" "${DIR}/src/gui_config/"*".py"
