cd "$(dirname "${BASH_SOURCE[0]}")"
SCRIPTPATH="$(pwd -P)"

asciidoctor index.adoc chapters/{generators,first-randomization,commands,second-randomization,styling}.adoc
