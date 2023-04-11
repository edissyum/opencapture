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


from flask import Blueprint, request, make_response, jsonify
from flask_babel import gettext

from src.backend.import_controllers import auth, history, privileges

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
    if not privileges.has_privileges(request.environ['user_id'], ['history | statistics']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/list'}), 403

    _history = history.get_history(request.args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/submodules', methods=['GET'])
@auth.token_required
def get_history_submodules():
    if not privileges.has_privileges(request.environ['user_id'], ['history']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/submodules'}), 403

    _history = history.get_history_submodules(request.args)
    return make_response(jsonify(_history[0])), _history[1]


@bp.route('history/users', methods=['GET'])
@auth.token_required
def get_history_users():
    if not privileges.has_privileges(request.environ['user_id'], ['history']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/history/users'}), 403

    _history = history.get_history_users()
    return make_response(jsonify(_history[0])), _history[1]
