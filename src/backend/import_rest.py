from .functions import get_custom_array

custom_array = get_custom_array()


if 'auth' not in custom_array or 'rest' not in custom_array['auth']['path']:
    from .rest import auth
elif 'rest' in custom_array['auth']['path']:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]),
                   custom_array['auth']['module'])

if 'user' not in custom_array or 'rest' not in custom_array['user']['path']:
    from .rest import user
elif 'rest' in custom_array['user']['path']:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]),
                   custom_array['user']['module'])

if 'locale' not in custom_array or 'rest' not in custom_array['locale']['path']:
    from .rest import locale
elif 'rest' in custom_array['locale']['path']:
    locale = getattr(__import__(custom_array['locale']['path'], fromlist=[custom_array['locale']['module']]),
                     custom_array['locale']['module'])

if 'config' not in custom_array or 'rest' not in custom_array['config']['path']:
    from .rest import config
elif 'rest' in custom_array['config']['path']:
    config = getattr(__import__(custom_array['config']['path'], fromlist=[custom_array['config']['module']]),
                     custom_array['config']['module'])

if 'verifier' not in custom_array or 'rest' not in custom_array['verifier']['path']:
    from .rest import verifier
elif 'rest' in custom_array['verifier']['path']:
    splitter = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]),
                       custom_array['verifier']['module'])

if 'splitter' not in custom_array or 'rest' not in custom_array['splitter']['path']:
    from .rest import splitter
elif 'rest' in custom_array['splitter']['path']:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]),
                       custom_array['splitter']['module'])

if 'roles' not in custom_array or 'rest' not in custom_array['roles']['path']:
    from .rest import roles
elif 'rest' in custom_array['roles']['path']:
    roles = getattr(__import__(custom_array['roles']['path'], fromlist=[custom_array['roles']['module']]),
                       custom_array['roles']['module'])

if 'forms' not in custom_array or 'rest' not in custom_array['forms']['path']:
    from .rest import forms
elif 'rest' in custom_array['forms']['path']:
    forms = getattr(__import__(custom_array['forms']['path'], fromlist=[custom_array['forms']['module']]),
                       custom_array['forms']['module'])

if 'history' not in custom_array or 'rest' not in custom_array['history']['path']:
    from .rest import history
elif 'rest' in custom_array['history']['path']:
    history = getattr(__import__(custom_array['history']['path'], fromlist=[custom_array['history']['module']]),
                       custom_array['history']['module'])


if 'positions_masks' not in custom_array or 'rest' not in custom_array['positions_masks']['path']:
    from .rest import positions_masks
elif 'rest' in custom_array['positions_masks']['path']:
    positions_masks = getattr(__import__(custom_array['positions_masks']['path'], fromlist=[custom_array['positions_masks']['module']]),
                       custom_array['positions_masks']['module'])

if 'status' not in custom_array or 'rest' not in custom_array['status']['path']:
    from .rest import status
elif 'rest' in custom_array['status']['path']:
    status = getattr(__import__(custom_array['status']['path'], fromlist=[custom_array['status']['module']]),
                       custom_array['status']['module'])

if 'accounts' not in custom_array or 'rest' not in custom_array['accounts']['path']:
    from .rest import accounts
elif 'rest' in custom_array['accounts']['path']:
    accounts = getattr(__import__(custom_array['accounts']['path'], fromlist=[custom_array['accounts']['module']]),
                       custom_array['accounts']['module'])

if 'privileges' not in custom_array or 'rest' not in custom_array['privileges']['path']:
    from .rest import privileges
elif 'rest' in custom_array['privileges']['path']:
    privileges = getattr(__import__(custom_array['privileges']['path'], fromlist=[custom_array['privileges']['module']]),
                       custom_array['privileges']['module'])

if 'custom_fields' not in custom_array or 'rest' not in custom_array['custom_fields']['path']:
    from .rest import custom_fields
elif 'rest' in custom_array['custom_fields']['path']:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]),
                       custom_array['custom_fields']['module'])

if 'outputs' not in custom_array or 'rest' not in custom_array['outputs']['path']:
    from .rest import outputs
elif 'rest' in custom_array['outputs']['path']:
    outputs = getattr(__import__(custom_array['outputs']['path'], fromlist=[custom_array['outputs']['module']]),
                       custom_array['outputs']['module'])

if 'maarch' not in custom_array or 'rest' not in custom_array['maarch']['path']:
    from .rest import maarch
elif 'rest' in custom_array['maarch']['path']:
    maarch = getattr(__import__(custom_array['maarch']['path'], fromlist=[custom_array['maarch']['module']]),
                       custom_array['maarch']['module'])

if 'inputs' not in custom_array or 'rest' not in custom_array['inputs']['path']:
    from .rest import inputs
elif 'rest' in custom_array['inputs']['path']:
    inputs = getattr(__import__(custom_array['inputs']['path'], fromlist=[custom_array['inputs']['module']]),
                       custom_array['inputs']['module'])
