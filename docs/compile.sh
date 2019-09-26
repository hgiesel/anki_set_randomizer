cd "$(dirname "${BASH_SOURCE[0]}")"
SCRIPTPATH="$(pwd -P)"

rm index.html chapters/*html
asciidoctor index.adoc chapters/{1-generators,2-first-randomization,3-commands,4-second-randomization,5-styling}.adoc
