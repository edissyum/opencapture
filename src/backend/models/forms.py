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


def retrieve_forms(args):
    db = get_db()
    error = None
    forms = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return forms, error


def update(args):
    db = get_db()
    error = None

    res = db.update({
        'table': ['custom_fields'],
        'set': {
            'label': args['label'],
            'type': args['type'],
            'module': args['module'],
            'enabled': args['enabled'],
            'label_short': args['label_short'],
        },
        'where': ['id = %s'],
        'data': [args['id']]
    })

    if not res:
        error = gettext('UPDATE_CUSTOM_FIELDS_ERROR')

    return res, error
