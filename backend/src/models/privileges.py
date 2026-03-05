# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from ..helpers import get_context_var


def get_privileges():
    database = get_context_var('database', 0)
    error = None
    privileges = database.select({
        'select': ['*'],
        'table': ['privileges']
    })

    if not privileges:
        error = gettext('ERROR_RETRIEVING_PRIVILEGES')

    return privileges, error


def get_by_role_id(args):
    database = get_context_var('database', 0)
    error = None
    privileges = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['roles_privileges'],
        'where': ['role_id = %s'],
        'data': [args['role_id']]
    })

    if not privileges:
        error = gettext('ERROR_RETRIEVING_PRIVILEGES')
    else:
        privileges = privileges[0]

    return privileges, error


def get_by_user_id(args):
    database = get_context_var('database', 0)
    error = None
    privileges = database.select({
        'select': ['*', 'users.id'] if 'select' not in args else args['select'],
        'table': ['roles_privileges', 'users'],
        'left_join': ['roles_privileges.role_id = users.role'],
        'where': ['users.id = %s'],
        'data': [args['user_id']]
    })

    if not privileges:
        error = gettext('ERROR_RETRIEVING_PRIVILEGES')
    else:
        privileges = privileges[0]

    return privileges, error
