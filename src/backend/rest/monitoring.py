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
from flask import Blueprint, make_response, jsonify, request
from src.backend.import_controllers import auth, monitoring, privileges

bp = Blueprint('monitoring', __name__, url_prefix='/ws/')


@bp.route('monitoring/list', methods=['GET'])
@auth.token_required
def get_processes():
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/monitoring/list'}), 403

    processes = monitoring.get_processes()
    return make_response(jsonify(processes[0])), processes[1]


@bp.route('monitoring/getProcessById/<int:process_id>', methods=['GET'])
@auth.token_required
def get_process_by_id(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/monitoring/getProcessById/{process_id}'}), 403

    process = monitoring.get_process_by_id(process_id)
    return make_response(jsonify(process[0])), process[1]


@bp.route('monitoring/getProcessByToken', methods=['POST'])
@auth.token_required
def get_process_by_token():
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/monitoring/getProcessByToken'}), 403

    if 'token' in request.json and request.json['token']:
        token = str(request.json['token'])
    else:
        return jsonify({'errors': gettext('TOKEN_IS_MANDATORY'), 'message': ''}), 400

    process = monitoring.get_process_by_token(token)
    return make_response(jsonify(process[0])), process[1]
