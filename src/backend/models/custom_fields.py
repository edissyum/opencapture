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
from ..import_controllers import db


def add_custom_field(args):
    _db = db.get_db()
    error = None
    customs_exists, error = retrieve_custom_fields({
        'where': ['label_short = %s', 'module = %s'],
        'data': [args['label_short'], args['module']]
    })

    if not customs_exists:
        args = {
            'table': 'custom_fields',
            'columns': {
                'label_short': args['label_short'],
                'label': args['label'],
                'type': args['type'],
                'module': args['module'],
            }
        }
        res = _db.insert(args)

        if not res:
            error = gettext('ADD_CUSTOM_FIELD_ERROR')
        return res, error
    else:
        error = gettext('CUSTOM_FIELD_ALREADY_EXIST')

    return '', error


def retrieve_custom_fields(args):
    _db = db.get_db()
    error = None
    custom_fields = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['custom_fields'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data']
    })

    return custom_fields, error


def update(args):
    _db = db.get_db()
    error = None

    res = _db.update({
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
