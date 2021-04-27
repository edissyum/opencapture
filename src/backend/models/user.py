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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from gettext import gettext
from ..controllers.db import get_db


def retrieve_users(args):
    db = get_db()
    error = None
    users = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    if not users:
        error = gettext('USER_ERROR')

    return users, error


def get_user_by_id(args):
    db = get_db()
    error = None
    user = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['id = %s'],
        'data': [args['user_id']]
    })

    if not user:
        error = gettext('ERROR_WHILE_RETRIEVING_USER')
    else:
        user = user[0]

    return user, error
