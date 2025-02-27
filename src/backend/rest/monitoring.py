# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, make_response, jsonify, request
from src.backend.controllers import auth, monitoring, privileges, verifier

bp = Blueprint('monitoring', __name__, url_prefix='/ws/')


@bp.route('monitoring/list', methods=['GET'])
@auth.token_required
def get_processes():
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/monitoring/list'}), 403

    processes = monitoring.get_processes()
    return make_response(jsonify(processes[0])), processes[1]


@bp.route('monitoring/<string:module>/lasts', methods=['GET'])
@auth.token_required
def get_last_task(module):
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/monitoring/{module}/lasts'}), 403

    processes = monitoring.get_processes(module, get_last_processes=True)
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

    check, message = rest_validator(request.json, [
        {'id': 'token', 'type': str, 'mandatory': True},
        {'id': 'retrieveData', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    retrieve_data = False
    if 'retrieveData' in request.json and request.json['retrieveData']:
        retrieve_data = request.json['retrieveData']

    process, status = monitoring.get_process_by_token(request.json['token'])
    if process and process['process'] and retrieve_data:
        if 'document_ids' in process['process'][0] and process['process'][0]['document_ids']:
            process['document_data'] = {}
            for document_id in process['process'][0]['document_ids']:
                document_data = verifier.get_document_by_id(document_id)
                if document_data:
                    document_data = document_data[0]
                    process['document_data'][document_id] = document_data['datas']
                    process['document_data'][document_id]['status'] = document_data['status']
    return make_response(jsonify(process)), status
