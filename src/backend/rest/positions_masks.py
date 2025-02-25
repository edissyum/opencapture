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

import os
import base64
from flask_babel import gettext
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url, rest_validator
from src.backend.controllers import auth, positions_masks, verifier, privileges
from flask import Blueprint, request, make_response, jsonify, current_app, g as current_context

bp = Blueprint('positions_masks', __name__, url_prefix='/ws/')


@bp.route('positions_masks/list', methods=['GET'])
@auth.token_required
def get_positions_masks():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'positions_mask_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/positions_masks/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = positions_masks.get_positions_masks(request.args)
    return make_response(jsonify(res[0]), res[1])


@bp.route('positions_masks/add', methods=['POST'])
@auth.token_required
def add_positions_mask():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/positions_masks/add'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'label', 'type': str, 'mandatory': False},
        {'id': 'form_id', 'type': int, 'mandatory': False},
        {'id': 'supplier_id', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = positions_masks.add_positions_mask(request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/getById/<int:position_mask_id>', methods=['GET'])
@auth.token_required
def get_positions_mask_by_id(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/getById/{position_mask_id}'}), 403

    _positions_mask = positions_masks.get_positions_mask_by_id(position_mask_id)
    return make_response(jsonify(_positions_mask[0])), _positions_mask[1]


@bp.route('positions_masks/update/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_positions_mask(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/update/{position_mask_id}'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'label', 'type': str, 'mandatory': False},
        {'id': 'regex', 'type': dict, 'mandatory': True},
        {'id': 'form_id', 'type': int, 'mandatory': False},
        {'id': 'supplier_id', 'type': int, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = positions_masks.update_positions_mask(position_mask_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/updatePositions/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_positions_by_positions_mask_id(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/updatePositions/{position_mask_id}'}), 403

    res = positions_masks.update_positions_by_positions_mask_id(position_mask_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/updatePages/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_pages_by_positions_mask_id(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/updatePages/{position_mask_id}'}), 403

    res = positions_masks.update_pages_by_positions_mask_id(position_mask_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/delete/<int:position_mask_id>', methods=['DELETE'])
@auth.token_required
def delete_positions_mask(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'positions_mask_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/delete/{position_mask_id}'}), 403

    res = positions_masks.delete_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/duplicate/<int:position_mask_id>', methods=['POST'])
@auth.token_required
def duplicate_positions_mask(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'positions_mask_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/duplicate/{position_mask_id}'}), 403

    res = positions_masks.duplicate_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/disable/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def disable_positions_mask(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'positions_mask_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/disable/{position_mask_id}'}), 403

    res = positions_masks.disable_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/enable/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def enable_positions_mask(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'positions_mask_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/enable/{position_mask_id}'}), 403

    res = positions_masks.enable_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/<int:position_mask_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_position_by_positions_mask_id(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/{position_mask_id}/deletePosition'}), 403

    res = positions_masks.delete_position_by_positions_mask_id(position_mask_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('positions_masks/<int:position_mask_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_page_by_positions_mask_id(position_mask_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_positions_mask']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/positions_masks/{position_mask_id}/deletePage'}), 403

    res = positions_masks.delete_page_by_positions_mask_id(position_mask_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('positions_masks/getImageFromPdf/<int:positions_mask_id>', methods=['POST'])
@auth.token_required
def get_image_from_pdf(positions_mask_id):
    if 'docservers' in current_context and 'files' in current_context:
        files = current_context.files
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        files = _vars[3]
        docservers = _vars[9]

    file = request.files
    path = current_app.config['UPLOAD_FOLDER']
    docserver_path = docservers['VERIFIER_POSITIONS_MASKS'] + '/'
    file_content = tmp_filename = img_wdith = nb_pages = None

    for filename in file:
        f = file[filename]
        filename_after_upload = files.save_uploaded_file(f, path)
        tmp_filename = filename.replace('.pdf', '-001.jpg')
        files.save_img_with_pdf2image(filename_after_upload, docserver_path + filename.replace('.pdf', '.jpg'))
        img_wdith = str(files.get_width(docserver_path + tmp_filename))
        file_content = verifier.get_file_content('positions_masks', tmp_filename, 'image/jpeg')
        nb_pages = files.get_pages(docservers['ERROR_PATH'], filename_after_upload)

        positions_masks.update_positions_mask(positions_mask_id, {
            'filename': filename.replace('.pdf', '-001.jpg'),
            'width': img_wdith,
            'nb_pages': nb_pages
        })

        try:
            os.remove(path + filename)
        except FileNotFoundError:
            pass

    if file_content:
        return make_response({
            'file': str(base64.b64encode(file_content.get_data()).decode('utf-8')),
            'width': img_wdith,
            'filename': tmp_filename,
            'nb_pages': nb_pages
        }), 200
    else:
        return '', 400
