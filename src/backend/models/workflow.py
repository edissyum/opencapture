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

from flask_babel import gettext
from flask import request, g as current_context
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_workflows(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    _workflows = database.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["workflows"],
        'where': args['where'],
        'data': [] if "data" not in args else args["data"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })

    return _workflows


def get_workflow_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    _workflow = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['workflows'],
        'where': ['id = %s'],
        'data': [args['workflow_id']]
    })

    if not _workflow:
        error = gettext('WORKFLOW_DOESNT_EXISTS')
    else:
        _workflow = _workflow[0]

    return _workflow, error


def get_workflow_by_workflow_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    _workflow = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['workflows'],
        'where': ['workflow_id = %s'],
        'data': [args['workflow_id']]
    })

    if not _workflow:
        error = gettext('WORKFLOW_DOESNT_EXISTS')
    else:
        _workflow = _workflow[0]

    return _workflow, error


def create_workflow(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    _workflow = database.insert({
        'table': 'workflows',
        'columns': args['columns'],
    })

    if not _workflow:
        error = gettext('WORKFLOW_CREATE_ERROR')

    return _workflow, error


def update_workflow(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    _workflow = database.update({
        'table': ['workflows'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['workflow_id']]
    })

    if _workflow[0] is False:
        error = gettext('WORKFLOW_UPDATE_ERROR')

    return _workflow, error


def get_workflow_by_form_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    _workflow = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['workflows'],
        'where': ["input #>> '{apply_process}' = %s", "process #>> '{form_id}' = %s", 'status <> %s'],
        'data': ['true', str(args['form_id']), 'DEL']
    })

    return _workflow, error
