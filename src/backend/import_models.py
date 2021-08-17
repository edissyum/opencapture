from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'auth' not in custom_array:
    from .models import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'user' not in custom_array:
    from .models import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'roles' not in custom_array:
    from .models import roles
else:
    roles = getattr(__import__(custom_array['roles']['path'], fromlist=[custom_array['user']['module']]), custom_array['roles']['module'])

if 'forms' not in custom_array:
    from .models import forms
else:
    forms = getattr(__import__(custom_array['forms']['path'], fromlist=[custom_array['forms']['module']]), custom_array['forms']['module'])

if 'splitter' not in custom_array:
    from .models import splitter
else:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]), custom_array['splitter']['module'])

if 'accounts' not in custom_array:
    from .models import accounts
else:
    accounts = getattr(__import__(custom_array['accounts']['path'], fromlist=[custom_array['accounts']['module']]), custom_array['accounts']['module'])

if 'verifier' not in custom_array:
    from .models import verifier
else:
    verifier = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]), custom_array['verifier']['module'])

if 'status' not in custom_array:
    from .models import status
else:
    status = getattr(__import__(custom_array['status']['path'], fromlist=[custom_array['status']['module']]), custom_array['status']['module'])

if 'privileges' not in custom_array:
    from .models import privileges
else:
    privileges = getattr(__import__(custom_array['privileges']['path'], fromlist=[custom_array['privileges']['module']]), custom_array['privileges']['module'])

if 'custom_fields' not in custom_array:
    from .models import custom_fields
else:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]), custom_array['custom_fields']['module'])

if 'outputs' not in custom_array:
    from .models import outputs
else:
    outputs = getattr(__import__(custom_array['outputs']['path'], fromlist=[custom_array['outputs']['module']]), custom_array['outputs']['module'])

if 'inputs' not in custom_array:
    from .models import inputs
else:
    inputs = getattr(__import__(custom_array['inputs']['path'], fromlist=[custom_array['inputs']['module']]), custom_array['inputs']['module'])
