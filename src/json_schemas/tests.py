import os
import json
from jsonschema import validate, RefResolver, Draft7Validator


dirpath = f'{os.path.dirname(os.path.realpath(__file__))}/setting.json'
instance = {
    "modelName": "meh",
    "description": "bla",
    "enabled": True,
    "insertAnkiPersistence": True,
    "pasteIntoTemplate": True,
    "iterations": [{
        "name": "foo",
    }],
}

schema_path = f'file:{dirpath}'

with open(dirpath, 'r') as jsonfile:
    schema = json.load(jsonfile)
    resolver = RefResolver(
        schema_path,
        schema,
    )

    validator = Draft7Validator(schema, resolver=resolver, format_checker=None)
    # instance['enabled'] = True
    validator.validate(instance)
