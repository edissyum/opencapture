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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import request
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_privileges():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    privileges = database.select({
        'select': ['*'],
        'table': ['privileges'],
    })

    if not privileges:
        error = gettext('ERROR_RETRIEVING_PRIVILEGES')

    return privileges, error


def get_by_role_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
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
