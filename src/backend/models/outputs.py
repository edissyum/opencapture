# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import request, g as current_context
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_outputs(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    outputs = database.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["outputs"],
        'where': args['where'],
        'data': args['data'],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })

    return outputs


def get_outputs_types(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    outputs_types = database.select({
        'select': ["*"],
        'table': ["outputs_types"],
        'order_by': ["id ASC"],
        'where': args['where'],
        'data': args['data'],
    })

    return outputs_types


def get_output_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    output = database.select({
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
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    output = database.select({
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
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    output = database.update({
        'table': ['outputs'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['output_id']]
    })

    if output[0] is False:
        error = gettext('OUTPUT_UPDATE_ERROR')

    return output, error


def create_output(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    output = database.insert({
        'table': 'outputs',
        'columns': args['columns'],
    })

    if not output:
        error = gettext('OUTPUT_CREATE_ERROR')

    return output, error
