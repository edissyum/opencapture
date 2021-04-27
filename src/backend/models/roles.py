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
from ..controllers.db import get_db


def get_roles():
    db = get_db()
    error = None

    roles = db.select({
        'select': ['*'],
        'table': ['roles'],
    })

    if not roles:
        error = gettext('ERROR_RETRIEVING_ROLES')

    return roles, error


def get_role_by_id(args):
    db = get_db()
    error = None
    role_id = args['role_id']
    role = db.select({
        'select': ['*'],
        'table': ['roles'],
        'where': ['id = %s'],
        'data': [role_id]
    })

    if not role:
        error = gettext('ERROR_RETRIEVING_ROLE')
    else:
        role = role[0]

    return role, error
