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


def get_outputs(args):
    _db = db.get_db()
    outputs = _db.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["outputs"],
        'where': ["status NOT IN (%s)"],
        'data': ["DEL"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return outputs


def get_outputs_types():
    _db = db.get_db()
    outputs_types = _db.select({
        'select': ["*"],
        'table': ["outputs_types"],
        'order_by': ["id ASC"],
    })

    return outputs_types


def get_output_by_id(args):
    _db = db.get_db()
    error = None
    output = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['outputs'],
        'where': ['id = %s'],
        'data': [args['output_id']]
    })

    if not output:
        error = gettext('OUTPUT_DOESNT_EXISTS')
    else:
        output = output[0]

    return output, error


def get_output_type_by_id(args):
    _db = db.get_db()
    error = None
    output = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['outputs_types'],
        'where': ['output_type_id = %s'],
        'data': [args['output_type_id']]
    })

    if not output:
        error = gettext('OUTPUT_TYPE_DOESNT_EXISTS')
    else:
        output = output[0]

    return output, error


def update_output(args):
    _db = db.get_db()
    error = None

    output = _db.update({
        'table': ['outputs'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['output_id']]
    })

    if output[0] is False:
        error = gettext('OUTPUT_UPDATE_ERROR')

    return output, error


def create_output(args):
    _db = db.get_db()
    error = None

    output = _db.insert({
        'table': 'outputs',
        'columns': args['columns'],
    })

    if not output:
        error = gettext('OUTPUT_CREATE_ERROR')

    return output, error
