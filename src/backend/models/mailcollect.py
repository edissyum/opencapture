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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask import request, g as current_context
from flask_babel import gettext

from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def retrieve_processes(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        if not _vars[0]:
            return {}, _vars[1]
        database = _vars[0]
    error = None
    processes = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['mailcollect'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0
    })
    return processes, error


def get_process_by_name(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        if not _vars[0]:
            return {}, _vars[1]
        database = _vars[0]
    error = None
    process = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['mailcollect'],
        'where': ['name = %s'],
        'data': [args['process_name']],
        'order_by': ['id ASC']
    })
    return process, error


def update_process(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        if not _vars[0]:
            return {}, _vars[1]
        database = _vars[0]
    error = None
    process = database.update({
        'table': ['mailcollect'],
        'set': args['set'],
        'where': ['name = %s'],
        'data': [args['process_name']]
    })
    if process[0] is False:
        error = gettext('MAILCOLLECT_PROCESS_UPDATE_ERROR')
    return process, error


def create_process(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        if not _vars[0]:
            return {}, _vars[1]
        database = _vars[0]
    error = None
    args = {
        'table': 'mailcollect',
        'columns': args['columns']
    }
    process = database.insert(args)

    return process, error
