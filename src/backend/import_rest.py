from .functions import get_custom_array

custom_array = get_custom_array()


if 'auth' not in custom_array:
    from .rest import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]),
                   custom_array['auth']['module'])

if 'user' not in custom_array:
    from .rest import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]),
                   custom_array['user']['module'])

if 'locale' not in custom_array:
    from .rest import locale
else:
    locale = getattr(__import__(custom_array['locale']['path'], fromlist=[custom_array['locale']['module']]),
                     custom_array['locale']['module'])

if 'config' not in custom_array:
    from .rest import config
else:
    config = getattr(__import__(custom_array['config']['path'], fromlist=[custom_array['config']['module']]),
                     custom_array['config']['module'])

if 'verifier' not in custom_array:
    from .rest import verifier
else:
    splitter = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]),
                       custom_array['verifier']['module'])

if 'splitter' not in custom_array:
    from .rest import splitter
else:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]),
                       custom_array['splitter']['module'])

if 'roles' not in custom_array:
    from .rest import roles
else:
    roles = getattr(__import__(custom_array['roles']['path'], fromlist=[custom_array['roles']['module']]),
                       custom_array['roles']['module'])

if 'forms' not in custom_array:
    from .rest import forms
else:
    forms = getattr(__import__(custom_array['forms']['path'], fromlist=[custom_array['forms']['module']]),
                       custom_array['forms']['module'])

if 'positions_masks' not in custom_array:
    from .rest import positions_masks
else:
    positions_masks = getattr(__import__(custom_array['positions_masks']['path'], fromlist=[custom_array['positions_masks']['module']]),
                       custom_array['positions_masks']['module'])

if 'status' not in custom_array:
    from .rest import status
else:
    status = getattr(__import__(custom_array['status']['path'], fromlist=[custom_array['status']['module']]),
                       custom_array['status']['module'])

if 'accounts' not in custom_array:
    from .rest import accounts
else:
    accounts = getattr(__import__(custom_array['accounts']['path'], fromlist=[custom_array['accounts']['module']]),
                       custom_array['accounts']['module'])

if 'privileges' not in custom_array:
    from .rest import privileges
else:
    privileges = getattr(__import__(custom_array['privileges']['path'], fromlist=[custom_array['privileges']['module']]),
                       custom_array['privileges']['module'])

if 'custom_fields' not in custom_array:
    from .rest import custom_fields
else:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]),
                       custom_array['custom_fields']['module'])

if 'outputs' not in custom_array:
    from .rest import outputs
else:
    outputs = getattr(__import__(custom_array['outputs']['path'], fromlist=[custom_array['outputs']['module']]),
                       custom_array['outputs']['module'])

if 'maarch' not in custom_array:
    from .rest import maarch
else:
    maarch = getattr(__import__(custom_array['maarch']['path'], fromlist=[custom_array['maarch']['module']]),
                       custom_array['maarch']['module'])

if 'inputs' not in custom_array:
    from .rest import inputs
else:
    inputs = getattr(__import__(custom_array['inputs']['path'], fromlist=[custom_array['inputs']['module']]),
                       custom_array['inputs']['module'])
