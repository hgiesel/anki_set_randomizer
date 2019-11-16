import os
import json
from jsonschema import validate, RefResolver, Draft7Validator


dirpath = f'{os.path.dirname(os.path.realpath(__file__))}/inj.json'
instance = {
    "name": "Hello world",
    # "enabled": True,
    "statements": ["foo", "bar"],
    "conditions": ["&", ["iter", "=", "foo"]],
    "description": "My injection",
}

schema_path = f'file:{dirpath}'
print(schema_path)

with open(dirpath, 'r') as jsonfile:
    schema = json.load(jsonfile)
    resolver = RefResolver(
        schema_path,
        schema,
    )

    validator = Draft7Validator(schema, resolver=resolver, format_checker=None)
    # instance['enabled'] = True
    validator.validate(instance)
