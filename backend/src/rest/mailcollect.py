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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from ..functions import rest_validator
from flask import Blueprint, jsonify, make_response, request
from ..controllers import mailcollect, auth, privileges

bp = Blueprint('mailcollect', __name__,  url_prefix='/ws/')


@bp.route('mailcollect/getProcesses', methods=['GET'])
@auth.token_required
def retrieve_processes():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/getProcesses'}), 403

    res = mailcollect.retrieve_processes({})
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/retrieveFolders', methods=['POST'])
@auth.token_required
def retrieve_folders():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/retrieveFolders'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'method', 'type': str, 'mandatory': True},
        {'id': 'port', 'type': int, 'mandatory': True if 'imap' in request.json['method'] else False},
        {'id': 'login', 'type': str, 'mandatory': bool([method for method in ['oauth', 'imap'] if method in request.json['method']])},
        {'id': 'secret', 'type': str, 'mandatory': True if 'oauth' in request.json['method'] else False},
        {'id': 'client_secret', 'type': str, 'mandatory': True if 'graphql' in request.json['method'] else False},
        {'id': 'scopes', 'type': str, 'mandatory': True if 'oauth' in request.json['method'] else False},
        {'id': 'scope', 'type': str, 'mandatory': True if 'graphql' in request.json['method'] else False},
        {'id': 'hostname', 'type': str, 'mandatory': bool([method for method in ['oauth', 'imap'] if method in request.json['method']])},
        {'id': 'password', 'type': str, 'mandatory': True if 'imap' in request.json['method'] else False},
        {'id': 'tenant_id', 'type': str, 'mandatory': bool([method for method in ['oauth', 'graphql'] if method in request.json['method']])},
        {'id': 'client_id', 'type': str, 'mandatory': bool([method for method in ['oauth', 'graphql'] if method in request.json['method']])},
        {'id': 'authority', 'type': str, 'mandatory': True if 'oauth' in request.json['method'] else False},
        {'id': 'secured_connection', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = mailcollect.retrieve_folders(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/updateProcess/<int:process_id>', methods=['POST'])
@auth.token_required
def update_process(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/updateProcess/{process_id}'}), 403
    check, message = rest_validator(request.json, [
        {'id': 'method', 'type': str, 'mandatory': True},
        {'id': 'options', 'type': dict, 'mandatory': True},
        {'id': 'is_splitter', 'type': bool, 'mandatory': False},
        {'id': 'folder_to_crawl', 'type': str, 'mandatory': True},
        {'id': 'copy_custom_id', 'type': int, 'mandatory': False},
        {'id': 'sender_custom_id', 'type': int, 'mandatory': False},
        {'id': 'ocr_attachments', 'type': bool, 'mandatory': False},
        {'id': 'folder_destination', 'type': str, 'mandatory': False},
        {'id': 'recipient_custom_id', 'type': int, 'mandatory': False},
        {'id': 'secured_connection', 'type': bool, 'mandatory': False},
        {'id': 'action_after_process', 'type': str, 'mandatory': True},
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = mailcollect.update_process({'set': request.json, 'process_id': process_id})
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/updateProcessName/<int:process_id>', methods=['PUT'])
@auth.token_required
def update_process_name(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/updateProcessName/{process_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'name', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = mailcollect.update_process({'set': request.json, 'process_id': process_id})
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/createProcess', methods=['POST'])
@auth.token_required
def create_process():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/mailcollect/createProcess'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'name', 'type': str, 'mandatory': True},
        {'id': 'method', 'type': str, 'mandatory': True},
        {'id': 'options', 'type': dict, 'mandatory': True},
        {'id': 'is_splitter', 'type': bool, 'mandatory': False},
        {'id': 'folder_to_crawl', 'type': str, 'mandatory': True},
        {'id': 'folder_destination', 'type': str, 'mandatory': False},
        {'id': 'secured_connection', 'type': bool, 'mandatory': False},
        {'id': 'action_after_process', 'type': str, 'mandatory': True},
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = mailcollect.create_process({'columns': request.json})
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/deleteProcess/<int:process_id>', methods=['DELETE'])
@auth.token_required
def delete_process(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/deleteProcess/{process_id}'}), 403

    res = mailcollect.delete_process(process_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/enableProcess/<int:process_id>', methods=['PUT'])
@auth.token_required
def enable_process(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/mailcollect/enableProcess/{process_id}'}), 403

    res = mailcollect.enable_process(process_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/disableProcess/<int:process_id>', methods=['PUT'])
@auth.token_required
def disable_process(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'mailcollect']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'# /mailcollect/disableProcess/{process_id}'}), 403

    res = mailcollect.disable_process(process_id)
    return make_response(jsonify(res[0])), res[1]
