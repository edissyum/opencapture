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
from src.backend.import_models import monitoring
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def get_processes():
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'DD/MM/YYYY HH24:MI:SS'
        _format_long = 'TMDay DD TMMonth YYYY HH24:MI:SS'
    else:
        _format = 'MM/DD/YYYY HH24:MI:SS'
        _format_long = 'Mon DD YYYY HH24:MI:SS'

    args = {
        'select': [
            '*',
            'count(*) OVER() as total',
            "to_char(creation_date, '" + _format + "') as creation_date",
            "to_char(creation_date, '" + _format_long + "') as creation_date_formated",
            "to_char(end_date, '" + _format + "') as end_date",
            "to_char(end_date, '" + _format_long + "') as end_date_formated"
        ],
        'offset': request.args['offset'] if 'offset' in request.args else 0,
        'limit': request.args['limit'] if 'limit' in request.args else 'ALL',
        'order_by': ['id DESC']
    }
    where = []
    data = []

    if 'module' in request.args and request.args['module']:
        where.append('module = %s')
        data.append(request.args['module'])

    if 'status' in request.args and request.args['status']:
        where.append('status = %s')
        data.append(request.args['status'])

    if where:
        args.update({'where': where, 'data': data})
    processses, _ = monitoring.get_processes(args)

    response = {
        "processses": processses
    }
    return response, 200


def get_process_by_id(process_id):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'TMDay DD TMMonth YYYY HH24:MI:SS'
    else:
        _format = 'Mon DD YYYY HH24:MI:SS'
    process, _ = monitoring.get_process_by_id(process_id, _format)

    response = {
        "process": process
    }
    return response, 200


def get_process_by_token(process_token):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'TMDay DD TMMonth YYYY HH24:MI:SS'
    else:
        _format = 'Mon DD YYYY HH24:MI:SS'
    process, _ = monitoring.get_process_by_token(process_token, _format)

    response = {
        "process": process
    }
    return response, 200


def create_process(args):
    process, _ = monitoring.insert(args)

    response = {
        "process": process
    }
    return response, 200
