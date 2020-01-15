from functools import reduce

version_string = '2.2'

def safenav_preset(preset):
    ensure_value = lambda v: v is not None

    def safenav_mod(records, props=[], preds=[ensure_value], default=None):
        nonlocal preset
        records.extend(preset)

        return safenav(records, props, preds, default)

    return safenav_mod

def safenav(records, props=[], preds=[], default=None):
    nothing = {}

    def access(record, prop):
        nonlocal nothing

        try:
            return record[prop]
        except:
            return nothing

    def find_record(found_record, record):
        nonlocal nothing

        if found_record is not nothing:
            return found_record
        else:
            preresult = reduce(access, props, record)

            def test_preresult(shortcut_value, pred):
                nonlocal preresult
                return shortcut_value and pred(preresult)

            return (preresult
                    if reduce(test_preresult, preds, True)
                    else nothing)

    result = reduce(find_record, records, nothing)
    return default if result is nothing else result

def find_my_addon(addon_name):
    import mw

    for name in (mw.addonManager.allAddons()):
        if mw.addonManager.addonName(name) == addon_name:
            return name
