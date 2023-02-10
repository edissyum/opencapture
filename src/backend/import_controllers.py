# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# pylint: skip-file

from .functions import get_custom_array
custom_array = get_custom_array()

if 'auth' or 'controllers' not in custom_array['auth']['path']:
    from .controllers import auth
elif 'controllers' in custom_array['auth']['path']:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'mailcollect' or 'controllers' not in custom_array['mailcollect']['path']:
    from .controllers import mailcollect
elif 'controllers' in custom_array['mailcollect']['path']:
    mailcollect = getattr(__import__(custom_array['mailcollect']['path'], fromlist=[custom_array['mailcollect']['module']]), custom_array['mailcollect']['module'])

if 'user' or 'controllers' not in custom_array['user']['path']:
    from .controllers import user
elif 'controllers' in custom_array['user']['path']:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'roles' or 'controllers' not in custom_array['roles']['path']:
    from .controllers import roles
elif 'controllers' in custom_array['roles']['path']:
    roles = getattr(__import__(custom_array['roles']['path'], fromlist=[custom_array['user']['module']]), custom_array['roles']['module'])

if 'config' or 'controllers' not in custom_array['config']['path']:
    from .controllers import config
elif 'controllers' in custom_array['config']['path']:
    config = getattr(__import__(custom_array['config']['path'], fromlist=[custom_array['config']['module']]), custom_array['config']['module'])

if 'forms' or 'controllers' not in custom_array['forms']['path']:
    from .controllers import forms
elif 'controllers' in custom_array['forms']['path']:
    forms = getattr(__import__(custom_array['forms']['path'], fromlist=[custom_array['forms']['module']]), custom_array['forms']['module'])

if 'history' or 'controllers' not in custom_array['history']['path']:
    from .controllers import history
elif 'controllers' in custom_array['history']['path']:
    history = getattr(__import__(custom_array['history']['path'], fromlist=[custom_array['history']['module']]), custom_array['history']['module'])

if 'positions_masks' or 'controllers' not in custom_array['positions_masks']['path']:
    from .controllers import positions_masks
elif 'controllers' in custom_array['positions_masks']['path']:
    positions_masks = getattr(__import__(custom_array['positions_masks']['path'], fromlist=[custom_array['positions_masks']['module']]), custom_array['positions_masks']['module'])

if 'outputs' or 'controllers' not in custom_array['outputs']['path']:
    from .controllers import outputs
else:
    outputs = getattr(__import__(custom_array['outputs']['path'], fromlist=[custom_array['outputs']['module']]), custom_array['outputs']['module'])

if 'splitter' or 'controllers' not in custom_array['splitter']['path']:
    from .controllers import splitter
elif 'controllers' in custom_array['splitter']['path']:
    splitter = getattr(__import__(custom_array['splitter']['path'], fromlist=[custom_array['splitter']['module']]), custom_array['splitter']['module'])

if 'accounts' or 'controllers' not in custom_array['accounts']['path']:
    from .controllers import accounts
elif 'controllers' in custom_array['accounts']['path']:
    accounts = getattr(__import__(custom_array['accounts']['path'], fromlist=[custom_array['accounts']['module']]), custom_array['accounts']['module'])

if 'verifier' or 'controllers' not in custom_array['verifier']['path']:
    from .controllers import verifier
elif 'controllers' in custom_array['verifier']['path']:
    verifier = getattr(__import__(custom_array['verifier']['path'], fromlist=[custom_array['verifier']['module']]), custom_array['verifier']['module'])

if 'status' or 'controllers' not in custom_array['status']['path']:
    from .controllers import status
elif 'controllers' in custom_array['status']['path']:
    status = getattr(__import__(custom_array['status']['path'], fromlist=[custom_array['status']['module']]), custom_array['status']['module'])

if 'privileges' or 'controllers' not in custom_array['privileges']['path']:
    from .controllers import privileges
elif 'controllers' in custom_array['privileges']['path']:
    privileges = getattr(__import__(custom_array['privileges']['path'], fromlist=[custom_array['privileges']['module']]), custom_array['privileges']['module'])

if 'custom_fields' or 'controllers' not in custom_array['custom_fields']['path']:
    from .controllers import custom_fields
elif 'controllers' in custom_array['custom_fields']['path']:
    custom_fields = getattr(__import__(custom_array['custom_fields']['path'], fromlist=[custom_array['custom_fields']['module']]), custom_array['custom_fields']['module'])

if 'mem' or 'controllers' not in custom_array['mem']['path']:
    from .controllers import mem
elif 'controllers' in custom_array['mem']['path']:
    mem = getattr(__import__(custom_array['mem']['path'], fromlist=[custom_array['mem']['module']]), custom_array['mem']['module'])

if 'inputs' or 'controllers' not in custom_array['inputs']['path']:
    from .controllers import inputs
elif 'controllers' in custom_array['inputs']['path']:
    inputs = getattr(__import__(custom_array['inputs']['path'], fromlist=[custom_array['inputs']['module']]), custom_array['inputs']['module'])

if 'doctypes' or 'controllers' not in custom_array['doctypes']['path']:
    from .controllers import doctypes
elif 'controllers' in custom_array['doctypes']['path']:
    doctypes = getattr(__import__(custom_array['doctypes']['path'], fromlist=[custom_array['doctypes']['module']]), custom_array['doctypes']['module'])

if 'tasks_watcher' or 'controllers' not in custom_array['tasks_watcher']['path']:
    from .controllers import tasks_watcher
elif 'controllers' in custom_array['tasks_watcher']['path']:
    tasks_watcher = getattr(__import__(custom_array['tasks_watcher']['path'], fromlist=[custom_array['tasks_watcher']['module']]), custom_array['tasks_watcher']['module'])

if 'artificial_intelligence' or 'controllers' not in custom_array['artificial_intelligence']['path']:
    from .controllers import artificial_intelligence
elif 'controllers' in custom_array['artificial_intelligence']['path']:
    artificial_intelligence = getattr(__import__(custom_array['artificial_intelligence']['path'], fromlist=[custom_array['artificial_intelligence']['module']]), custom_array['artificial_intelligence']['module'])

if 'smtp' or 'controllers' not in custom_array['smtp']['path']:
    from .controllers import smtp
elif 'controllers' in custom_array['smtp']['path']:
    smtp = getattr(__import__(custom_array['smtp']['path'], fromlist=[custom_array['smtp']['module']]), custom_array['smtp']['module'])
