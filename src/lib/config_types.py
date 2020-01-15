from dataclasses import dataclass
from typing import List

@dataclass
class SRClozeOptions:
    shortcuts_enabled: bool
    vs_prefix: str
    open_delim: str
    close_delim: str

@dataclass
class SROcclusionOptions:
    pass

@dataclass
class SRInputSyntax:
    css_selector: str
    open_delim: str
    close_delim: str
    field_separator: str
    is_regex: bool

@dataclass
class SRValues:
    values: List[str]
    delim: str
    random_start_index: bool
    collective_indexing: bool

@dataclass
class SRDefaultStyle:
    colors: SRValues
    classes: SRValues
    field_padding: int
    field_separator: str
    open_delim: str
    close_delim: str
    empty_set: str

    stroke: float
    stroke_opacity: float
    stroke_width: int
    fill: str
    fill_opacity: float

@dataclass
class SRIteration:
    name: str
    description: str
    enabled: bool
    input_syntax: SRInputSyntax
    default_style: SRDefaultStyle

@dataclass
class SRInjection:
    name: str
    description: str
    enabled: bool
    conditions: list
    statements: List[str]

@dataclass
class SRSourceMode:
    cloze_options: SRClozeOptions
    occlusion_options: SROcclusionOptions

@dataclass
class SRSetting:
    model_name: str
    description: str
    enabled: bool
    insert_anki_persistence: bool
    paste_into_template: bool
    iterations: List[SRIteration]
    injections: List[SRInjection]
    source_mode: SRSourceMode
