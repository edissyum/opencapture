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


def get_roles(args):
    db = get_db()
    error = None

    roles = db.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["roles"],
        'where': ["status NOT IN (%s)", "label <> 'SuperUtilisateur'"],
        'data': ["DEL"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    if not roles:
        error = gettext('NO_ROLES')

    return roles, error


def get_role_by_id(args):
    db = get_db()
    error = None
    role = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['roles'],
        'where': ['id = %s', "label <> %s", "status NOT IN (%s)"],
        'data': [args['role_id'], 'SuperUtilisateur', 'DEL']
    })

    if not role:
        error = gettext('ROLE_DOESNT_EXISTS')
    else:
        role = role[0]

    return role, error


def update_role(args):
    db = get_db()
    error = None

    role = db.update({
        'table': ['roles'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['role_id']]
    })

    if role[0] is False:
        error = gettext('ROLE_UPDATE_ERROR')

    return role, error
