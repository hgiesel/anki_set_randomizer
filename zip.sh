declare DIR=${BASH_SOURCE%/*}
rm "${DIR}/set_randomizer.ankiaddon"

if [[ "$1" == '-l' ]]; then
  declare addon_id='1164532380'
else
  declare addon_id='set_randomizer'
fi

zip -r "${DIR}/set_randomizer.ankiaddon" "${DIR}/__init__.py" "${DIR}/src/main.py" "${DIR}/src/lib/"* "${DIR}/src/gui/"*".py" "${DIR}/src/js/dist/"{front,back,anki-persistence}".js" "${DIR}/config."{json,md} "${DIR}/manifest.json"
