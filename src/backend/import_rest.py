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


if 'auth' not in custom_array or 'rest' not in custom_array['auth']['path']:
    from .rest import auth
elif 'rest' in custom_array['auth']['path']:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]),
                   custom_array['auth']['module'])

if 'workflow' not in custom_array or 'rest' not in custom_array['workflow']['path']:
    from .rest import workflow
elif 'rest' in custom_array['workflow']['path']:
    workflow = getattr(__import__(custom_array['workflow']['path'], fromlist=[custom_array['workflow']['module']]),
                   custom_array['workflow']['module'])

if 'monitoring' not in custom_array or 'rest' not in custom_array['monitoring']['path']:
    from .rest import monitoring
elif 'rest' in custom_array['monitoring']['path']:
    monitoring = getattr(__import__(custom_array['monitoring']['path'], fromlist=[custom_array['monitoring']['module']]),
                   custom_array['monitoring']['module'])

if 'user' not in custom_array or 'rest' not in custom_array['user']['path']:
    from .rest import user
elif 'rest' in custom_array['user']['path']:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]),
                   custom_array['user']['module'])

if 'mailcollect' not in custom_array or 'rest' not in custom_array['mailcollect']['path']:
    from .rest import mailcollect
elif 'rest' in custom_array['mailcollect']['path']:
    user = getattr(__import__(custom_array['mailcollect']['path'], fromlist=[custom_array['mailcollect']['module']]),
                   custom_array['mailcollect']['module'])

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

if 'mem' not in custom_array or 'rest' not in custom_array['mem']['path']:
    from .rest import mem
elif 'rest' in custom_array['mem']['path']:
    mem = getattr(__import__(custom_array['mem']['path'], fromlist=[custom_array['mem']['module']]),
                       custom_array['mem']['module'])

if 'doctypes' not in custom_array or 'rest' not in custom_array['doctypes']['path']:
    from .rest import doctypes
elif 'rest' in custom_array['doctypes']['path']:
    doctypes = getattr(__import__(custom_array['doctypes']['path'], fromlist=[custom_array['doctypes']['module']]),
                     custom_array['doctypes']['module'])

if 'artificial_intelligence' not in custom_array or 'rest' not in custom_array['artificial_intelligence']['path']:
    from .rest import artificial_intelligence
elif 'rest' in custom_array['artificial_intelligence']['path']:
    artificial_intelligence = getattr(__import__(custom_array['artificial_intelligence']['path'], fromlist=[custom_array['artificial_intelligence']['module']]),
                                      custom_array['artificial_intelligence']['module'])

if 'smtp' not in custom_array or 'rest' not in custom_array['smtp']['path']:
    from .rest import smtp
elif 'rest' in custom_array['smtp']['path']:
    smtp = getattr(__import__(custom_array['smtp']['path'], fromlist=[custom_array['smtp']['module']]), custom_array['smtp']['module'])
