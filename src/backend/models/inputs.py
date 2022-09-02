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

from flask import request, session
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_inputs(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    _inputs = database.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["inputs"],
        'where': args['where'],
        'data': [] if "data" not in args else args["data"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return _inputs


def get_input_by_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    _input = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['inputs'],
        'where': ['id = %s'],
        'data': [args['input_id']]
    })

    if not _input:
        error = gettext('INPUT_DOESNT_EXISTS')
    else:
        _input = _input[0]

    return _input, error


def get_input_by_form_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    _input = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['inputs'],
        'where': ['default_form_id = %s', 'status <> %s'],
        'data': [args['form_id'], 'DEL']
    })

    return _input, error


def update_input(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    _input = database.update({
        'table': ['inputs'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['input_id']]
    })

    if _input[0] is False:
        error = gettext('INPUT_UPDATE_ERROR')

    return _input, error


def create_input(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    _input = database.insert({
        'table': 'inputs',
        'columns': args['columns'],
    })

    if not input:
        error = gettext('INPUT_CREATE_ERROR')

    return _input, error
