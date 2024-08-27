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
from flask import Blueprint, request, make_response, jsonify

from src.backend.functions import rest_validator
from src.backend.controllers import auth, history, privileges

bp = Blueprint('history', __name__, url_prefix='/ws/')


@bp.route('history/add', methods=['POST'])
def add_history():
    check, message = rest_validator(request.json, [
        {'id': 'desc', 'type': str, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'user_id', 'type': int, 'mandatory': True},
        {'id': 'user_info', 'type': str, 'mandatory': True},
        {'id': 'submodule', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    data = request.json
    data['ip'] = request.remote_addr
    res = history.add_history(data)
    return make_response(res[0], res[1])


@bp.route('history/list', methods=['GET'])
@auth.token_required
def get_history():
    if not privileges.has_privileges(request.environ['user_id'], ['history | statistics']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'user', 'type': str, 'mandatory': False},
        {'id': 'year', 'type': int, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False},
        {'id': 'module', 'type': str, 'mandatory': False},
        {'id': 'submodule', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    _history = history.get_history(request.args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/submodules', methods=['GET'])
@auth.token_required
def get_history_submodules():
    if not privileges.has_privileges(request.environ['user_id'], ['history']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/submodules'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'module', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    _history = history.get_history_submodules(request.args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/users', methods=['GET'])
@auth.token_required
def get_history_users():
    if not privileges.has_privileges(request.environ['user_id'], ['history']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/users'}), 403

    _history = history.get_history_users()
    return make_response(jsonify(_history[0])), _history[1]
