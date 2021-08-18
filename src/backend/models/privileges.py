# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from ..main import create_classes_from_config


def get_privileges():
    _vars = create_classes_from_config()
    _db = _vars[0]
    error = None
    privileges = _db.select({
        'select': ['*'],
        'table': ['privileges'],
    })

    if not privileges:
        error = gettext('ERROR_RETRIEVING_PRIVILEGES')

    return privileges, error


def get_by_role_id(args):
    _vars = create_classes_from_config()
    _db = _vars[0]
    error = None
    privileges = _db.select({
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
