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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from ..main import create_classes_from_current_config
from werkzeug.security import check_password_hash


def login(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    user = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [args['username']]
    })

    if not user:
        error = gettext('BAD_USERNAME')
    elif not check_password_hash(user[0]['password'], args['password']):
        error = gettext('BAD_PASSWORD')
    elif user[0]['status'] == 'DEL':
        error = gettext('USER_DELETED')
    elif user[0]['enabled'] == 0:
        error = gettext('USER_DISABLED')
    else:
        user = user[0]

    return user, error
