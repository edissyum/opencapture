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
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, opencaptureformem

bp = Blueprint('opencaptureformem', __name__, url_prefix='/ws/')


@bp.route('opencaptureformem/getAccessToken', methods=['POST'])
@auth.token_required
def get_access_token():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'custom_id', 'type': str, 'mandatory': True},
        {'id': 'secret_key', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    connection = opencaptureformem.get_access_token(request.json['args'])
    return make_response(jsonify({'status': connection}), 200)


@bp.route('opencaptureformem/getProcesses', methods=['POST'])
@auth.token_required
def get_processes():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'secret_key', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    processes = opencaptureformem.get_processes(request.json['args'])
    return make_response(jsonify(processes)), 200