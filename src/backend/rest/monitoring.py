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

from src.backend.functions import retrieve_custom_from_url
from src.backend.import_controllers import auth, monitoring
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, request, make_response, jsonify, g as current_context

bp = Blueprint('monitoring', __name__, url_prefix='/ws/')


@bp.route('monitoring/list', methods=['GET'])
@auth.token_required
def get_processes():
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'DD/MM/YYYY HH24:MI:SS'
    else:
        _format = 'MM/DD/YYYY HH24:MI:SS'

    args = {
        'select': [
            '*',
            'count(*) OVER() as total',
            "to_char(creation_date, '" + _format + "') as creation_date",
            "to_char(end_date, '" + _format + "') as end_date"
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
    processes = monitoring.get_processes(args)
    return make_response(jsonify(processes[0])), processes[1]


@bp.route('monitoring/getProcessById/<int:process_id>', methods=['GET'])
@auth.token_required
def get_process_by_id(process_id):
    process = monitoring.get_process_by_id(process_id)
    return make_response(jsonify(process[0])), process[1]
