# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from src.backend.main import create_classes_from_current_config


def get_outputs(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    outputs = _db.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["outputs"],
        'where': args['where'],
        'data': args['data'],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return outputs


def get_outputs_types(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    outputs_types = _db.select({
        'select': ["*"],
        'table': ["outputs_types"],
        'order_by': ["id ASC"],
        'where': args['where'],
        'data': args['data'],
    })

    return outputs_types


def get_output_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    output = _db.insert({
        'table': 'outputs',
        'columns': args['columns'],
    })

    if not output:
        error = gettext('OUTPUT_CREATE_ERROR')

    return output, error
