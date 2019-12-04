declare DIR="${BASH_SOURCE%/*}"

rm -f "${DIR}/"*.py

for filename in "${DIR}/"*'.ui'; do
  pyuic5 $filename > "${filename%.*}_ui.py"
done
