from .functions import get_custom_array

custom_array = get_custom_array()

if 'auth' not in custom_array or 'models' not in custom_array['auth']['path']:
    from .models import auth
elif 'models' in custom_array['auth']['path']:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'user' or 'models' not in custom_array['user']['path']:
    from .models import user
elif 'models' in custom_array['user']['path']:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'roles' or 'models' not in custom_array['roles']['path']:
    from .models import roles
elif 'models' in custom_array['roles']['path']:
    roles = getattr(__import__(custom_array['roles']['path'], fromlist=[custom_array['user']['module']]), custom_array['roles']['module'])

if 'forms' or 'models' not in custom_array['forms']['path']:
    from .models import forms
elif 'models' in custom_array['forms']['path']:
    forms = getattr(__import__(custom_array['forms']['path'], fromlist=[custom_array['forms']['module']]), custom_array['forms']['module'])

if 'positions_masks' or 'models' not in custom_array['positions_masks']['path']:
    from .models import positions_masks
elif 'models' in custom_array['positions_masks']['path']:
    positions_masks = getattr(__import__(custom_array['positions_masks']['path'], fromlist=[custom_array['positions_masks']['module']]), custom_array['positions_masks']['module'])

if 'splitter' or 'models' not in custom_array['splitter']['path']:
    from .models import splitter
elif 'models' in custom_array['splitter']['path']:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]), custom_array['splitter']['module'])

if 'accounts' or 'models' not in custom_array['accounts']['path']:
    from .models import accounts
elif 'models' in custom_array['accounts']['path']:
    accounts = getattr(__import__(custom_array['accounts']['path'], fromlist=[custom_array['accounts']['module']]), custom_array['accounts']['module'])

if 'history' or 'models' not in custom_array['history']['path']:
    from .models import history
elif 'models' in custom_array['history']['path']:
    history = getattr(__import__(custom_array['history']['path'], fromlist=[custom_array['history']['module']]), custom_array['history']['module'])

if 'verifier' or 'models' not in custom_array['verifier']['path']:
    from .models import verifier
elif 'models' in custom_array['verifier']['path']:
    verifier = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]), custom_array['verifier']['module'])

if 'status' or 'models' not in custom_array['status']['path']:
    from .models import status
elif 'models' in custom_array['status']['path']:
    status = getattr(__import__(custom_array['status']['path'], fromlist=[custom_array['status']['module']]), custom_array['status']['module'])

if 'privileges' or 'models' not in custom_array['privileges']['path']:
    from .models import privileges
elif 'models' in custom_array['privileges']['path']:
    privileges = getattr(__import__(custom_array['privileges']['path'], fromlist=[custom_array['privileges']['module']]), custom_array['privileges']['module'])

if 'custom_fields' or 'models' not in custom_array['custom_fields']['path']:
    from .models import custom_fields
elif 'models' in custom_array['custom_fields']['path']:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]), custom_array['custom_fields']['module'])

if 'outputs' or 'models' not in custom_array['outputs']['path']:
    from .models import outputs
elif 'models' in custom_array['outputs']['path']:
    outputs = getattr(__import__(custom_array['outputs']['path'], fromlist=[custom_array['outputs']['module']]), custom_array['outputs']['module'])

if 'inputs' or 'models' not in custom_array['inputs']['path']:
    from .models import inputs
elif 'models' in custom_array['inputs']['path']:
    inputs = getattr(__import__(custom_array['inputs']['path'], fromlist=[custom_array['inputs']['module']]), custom_array['inputs']['module'])
