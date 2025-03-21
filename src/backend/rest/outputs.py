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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.controllers import auth, outputs, privileges

bp = Blueprint('outputs', __name__, url_prefix='/ws/')


@bp.route('outputs/<string:module>/list', methods=['GET'])
@auth.token_required
def get_outputs(module):
    list_priv = ['settings', 'outputs_list'] if module == 'verifier' else ['settings', 'outputs_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/outputs/{module}/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    args = dict(request.args)
    args['module'] = module
    _outputs = outputs.get_outputs(args)
    return make_response(jsonify(_outputs[0])), _outputs[1]


@bp.route('outputs/<string:module>/getOutputsTypes', methods=['GET'])
@auth.token_required
def get_outputs_types(module):
    list_priv = ['settings', 'add_output | update_output'] if module == 'verifier' else ['settings', 'add_output_splitter | update_output_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/outputs/{module}/getOutputsTypes'}), 403

    _outputs = outputs.get_outputs_types(module)
    return make_response(jsonify(_outputs[0])), _outputs[1]


@bp.route('outputs/getOutputTypeById/<string:output_type_id>', methods=['GET'])
@auth.token_required
def get_output_type_by_id(output_type_id):
    _outputs = outputs.get_output_type_by_id(output_type_id)
    return make_response(jsonify(_outputs[0])), _outputs[1]


@bp.route('outputs/<string:module>/getById/<int:output_id>', methods=['GET'])
@auth.token_required
def get_output_by_id(output_id, module):
    if 'skip' not in request.environ or not request.environ['skip']:
        list_priv = ['update_output | access_verifier'] if module == 'verifier' else ['update_output_splitter | access_splitter']
        if not privileges.has_privileges(request.environ['user_id'], list_priv):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/outputs/{module}/getById/{output_id}'}), 403

    _output = outputs.get_output_by_id(output_id)
    return make_response(jsonify(_output[0])), _output[1]


@bp.route('outputs/<string:module>/duplicate/<int:output_id>', methods=['POST'])
@auth.token_required
def duplicate_output(output_id, module):
    list_priv = ['settings', 'outputs_list'] if module == 'verifier' else ['settings', 'outputs_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/outputs/{module}/duplicate/{output_id}'}), 403

    res = outputs.duplicate_output(output_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/<string:module>/update/<int:output_id>', methods=['PUT'])
@auth.token_required
def update_output(output_id, module):
    list_priv = ['settings', 'update_output'] if module == 'verifier' else ['settings', 'update_output_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/outputs/{module}/update/{output_id}'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'output_label', 'type': str, 'mandatory': True},
        {'id': 'compress_type', 'type': str, 'mandatory': False},
        {'id': 'output_type_id', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = outputs.update_output(output_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/<string:module>/delete/<int:output_id>', methods=['DELETE'])
@auth.token_required
def delete_output(output_id, module):
    list_priv = ['settings', 'outputs_list'] if module == 'verifier' else ['settings', 'outputs_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/outputs/{module}/delete/{output_id}'}), 403

    res = outputs.delete_output(output_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/<string:module>/create', methods=['POST'])
@auth.token_required
def create_output(module):
    list_priv = ['settings', 'add_output'] if module == 'verifier' else ['settings', 'add_output_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/outputs/{module}/create'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'output_label', 'type': str, 'mandatory': True},
        {'id': 'compress_type', 'type': str, 'mandatory': False},
        {'id': 'output_type_id', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = outputs.create_output(request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/<string:module>/allowedPath', methods=['GET'])
@auth.token_required
def get_allowed_path(module):
    list_priv = ['settings', 'outputs_list'] if module == 'verifier' else ['settings', 'outputs_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/outputs/{module}/allowedPath'}), 403

    res = outputs.get_allowed_path()
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/<string:module>/verifyFolderOut', methods=['POST'])
@auth.token_required
def verify_folder_out(module):
    list_priv = ['settings', 'update_output'] if module == 'verifier' else ['update_output_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/outputs/{module}/verifyFolderOut'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'folder_out', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = outputs.verify_folder_out(request.json)
    return make_response(jsonify(res[0])), res[1]
