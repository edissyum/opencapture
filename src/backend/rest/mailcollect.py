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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from flask import Blueprint, jsonify, make_response, request
from src.backend.import_controllers import mailcollect, auth, privileges

bp = Blueprint('mailcollect', __name__,  url_prefix='/ws/')


@bp.route('mailcollect/getProcesses', methods=['GET'])
@auth.token_required
def retrieve_processes():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/getProcesses'}), 403

    args = {
        'select': ['*'],
        'where': ['status <> %s'],
        'data': ['DEL']
    }

    res = mailcollect.retrieve_processes(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/retrieveFolders', methods=['POST'])
@auth.token_required
def retrieve_folders():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/retrieveFolders'}), 403

    args = request.json
    res = mailcollect.retrieve_folders(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/updateProcess/<string:process_name>', methods=['POST'])
@auth.token_required
def update_process(process_name):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/updateProcesses/{process_name}'}), 403

    data = request.json
    args = {
        'set': data,
        'process_name': process_name
    }
    res = mailcollect.update_process(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/createProcess', methods=['POST'])
@auth.token_required
def create_process():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/createProcess'}), 403

    data = request.json
    args = {
        'columns': data
    }
    res = mailcollect.create_process(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/deleteProcess/<string:process_name>', methods=['DELETE'])
@auth.token_required
def delete_process(process_name):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/deleteProcess/{process_name}'}), 403

    res = mailcollect.delete_process(process_name)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/enableProcess/<string:process_name>', methods=['PUT'])
@auth.token_required
def enable_process(process_name):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/enableProcess/{process_name}'}), 403

    res = mailcollect.enable_process(process_name)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/disableProcess/<string:process_name>', methods=['PUT'])
@auth.token_required
def disable_process(process_name):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'# /mailcollect/disableProcess/{process_name}'}), 403

    res = mailcollect.disable_process(process_name)
    return make_response(jsonify(res[0])), res[1]
