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

import json
from src.backend.import_controllers import auth, history
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, request, make_response, jsonify, session

bp = Blueprint('history', __name__, url_prefix='/ws/')


@bp.route('history/add', methods=['POST'])
def add_history():
    data = request.json
    data['ip'] = request.remote_addr
    res = history.add_history(data)
    return make_response(res[0], res[1])


@bp.route('history/list', methods=['GET'])
@auth.token_required
def get_history():
    if 'configurations' in session:
        configurations = json.loads(session['configurations'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'DD/MM/YYYY HH24:MI:SS'
    else:
        _format = 'MM/DD/YYYY HH24:MI:SS'

    args = {
        'select': ['*', 'count(*) OVER() as total', "to_char(history_date, '" + _format + "') as date"],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'order_by': ['id DESC']
    }
    where = []
    data = []
    if 'user' in request.args and request.args['user']:
        where.append('user_id = %s')
        data.append(request.args['user'])
    if 'submodule' in request.args and request.args['submodule']:
        where.append('history_submodule = %s')
        data.append(request.args['submodule'])
    if 'module' in request.args and request.args['module']:
        where.append('history_module = %s')
        data.append(request.args['module'])
    if 'year' in request.args and request.args['year']:
        where.append('extract(year from history_date) = %s')
        data.append(request.args['year'])

    if where:
        args.update({'where': where, 'data': data})
    _history = history.get_history(args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/submodules', methods=['GET'])
@auth.token_required
def get_history_submodules():
    args = {
        'select': ['DISTINCT(history_submodule)'],
    }

    if 'module' in request.args and request.args['module']:
        args.update({'where':  ['history_module = %s'], 'data': [request.args['module']]})
    _history = history.get_history(args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/users', methods=['GET'])
@auth.token_required
def get_history_users():
    args = {
        'select': ['DISTINCT(user_id)'],
    }
    _history = history.get_history(args)
    return make_response(jsonify(_history[0])), _history[1]
