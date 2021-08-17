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
from ..import_controllers import db


def get_inputs(args):
    _db = db.get_db()
    inputs = _db.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["inputs"],
        'where': ["status NOT IN (%s)"],
        'data': ["DEL"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return inputs


def get_input_by_id(args):
    _db = db.get_db()
    error = None
    input = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['inputs'],
        'where': ['id = %s'],
        'data': [args['input_id']]
    })

    if not input:
        error = gettext('INPUT_DOESNT_EXISTS')
    else:
        input = input[0]

    return input, error


def update_input(args):
    _db = db.get_db()
    error = None

    input = _db.update({
        'table': ['inputs'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['input_id']]
    })

    if input[0] is False:
        error = gettext('INPUT_UPDATE_ERROR')

    return input, error


def create_input(args):
    _db = db.get_db()
    error = None

    input = _db.insert({
        'table': 'inputs',
        'columns': args['columns'],
    })

    if not input:
        error = gettext('INPUT_CREATE_ERROR')

    return input, error
