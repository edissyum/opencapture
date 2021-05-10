from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'db' not in custom_array:
    from .controllers import db
else:
    db = getattr(__import__(custom_array['db']['path'], fromlist=[custom_array['db']['module']]), custom_array['db']['module'])

if 'pdf' not in custom_array:
    from .controllers import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'auth' not in custom_array:
    from .controllers import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'user' not in custom_array:
    from .controllers import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

    
if 'config' not in custom_array:
    from .controllers import config
else:
    config = getattr(__import__(custom_array['config']['path'], fromlist=[custom_array['config']['module']]), custom_array['config']['module'])

if 'supplier' not in custom_array:
    from .controllers import supplier
else:
    supplier = getattr(__import__(custom_array['supplier']['path'], fromlist=[custom_array['supplier']['module']]), custom_array['supplier']['module'])

if 'splitter' not in custom_array:
    from .controllers import splitter
else:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]), custom_array['splitter']['module'])


if 'custom_fields' not in custom_array:
    from .controllers import custom_fields
else:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]), custom_array['custom_fields']['module'])
