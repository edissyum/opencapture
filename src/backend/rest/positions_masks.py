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

import os
import base64
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, request, make_response, jsonify, current_app
from src.backend.import_controllers import auth, positions_masks, verifier

bp = Blueprint('positions_masks', __name__, url_prefix='/ws/')


@bp.route('positions_masks/list', methods=['GET'])
@auth.token_required
def get_positions_masks():
    args = {
        'select': ['positions_masks.*', 'form_models.label as form_label', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'where': ["positions_masks.status <> 'DEL'"],
        'order_by': ['positions_masks.id ASC']
    }
    res = positions_masks.get_positions_masks(args)
    return make_response(jsonify(res[0]), res[1])


@bp.route('positions_masks/add', methods=['POST'])
@auth.token_required
def add_positions_mask():
    data = request.json['args']
    res = positions_masks.add_positions_mask(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/getById/<int:position_mask_id>', methods=['GET'])
@auth.token_required
def get_positions_mask_by_id(position_mask_id):
    _positions_mask = positions_masks.get_positions_mask_by_id(position_mask_id)
    return make_response(jsonify(_positions_mask[0])), _positions_mask[1]


@bp.route('positions_masks/fields/getBySupplierId/<int:supplier_id>', methods=['GET'])
@auth.token_required
def get_positions_mask_by_supplier_id(supplier_id):
    _positions_mask = positions_masks.get_positions_mask_fields_by_supplier_id(supplier_id)
    return make_response(jsonify(_positions_mask[0])), _positions_mask[1]


@bp.route('positions_masks/update/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_positions_mask(position_mask_id):
    data = request.json['args']
    res = positions_masks.update_positions_mask(position_mask_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/updatePositions/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_positions_by_positions_mask_id(position_mask_id):
    data = request.json['args']
    res = positions_masks.update_positions_by_positions_mask_id(position_mask_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/updatePages/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def update_pages_by_positions_mask_id(position_mask_id):
    data = request.json['args']
    res = positions_masks.update_pages_by_positions_mask_id(position_mask_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/delete/<int:position_mask_id>', methods=['DELETE'])
@auth.token_required
def delete_positions_mask(position_mask_id):
    res = positions_masks.delete_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/duplicate/<int:position_mask_id>', methods=['POST'])
@auth.token_required
def duplicate_positions_mask(position_mask_id):
    res = positions_masks.duplicate_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/disable/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def disable_positions_mask(position_mask_id):
    res = positions_masks.disable_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/enable/<int:position_mask_id>', methods=['PUT'])
@auth.token_required
def enable_positions_mask(position_mask_id):
    res = positions_masks.enable_positions_mask(position_mask_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('positions_masks/<int:position_mask_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_position_by_positions_mask_id(position_mask_id):
    field_id = request.json['args']
    res = positions_masks.delete_position_by_positions_mask_id(position_mask_id, field_id)
    return make_response(res[0], res[1])


@bp.route('positions_masks/<int:position_mask_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_page_by_positions_mask_id(position_mask_id):
    field_id = request.json['args']
    res = positions_masks.delete_page_by_positions_mask_id(position_mask_id, field_id)
    return make_response(res[0], res[1])


@bp.route('positions_masks/getImageFromPdf/<int:positions_mask_id>', methods=['POST'])
@auth.token_required
def get_image_from_pdf(positions_mask_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _Files = _vars[3]
    docservers = _vars[9]
    file = request.files
    path = current_app.config['UPLOAD_FOLDER']
    docserver_path = docservers['VERIFIER_POSITIONS_MASKS'] + '/'
    file_content = tmp_filename = img_wdith = nb_pages = None

    for filename in file:
        f = file[filename]
        filename_after_upload = _Files.save_uploaded_file(f, path)
        tmp_filename = filename.replace('.pdf', '-001.jpg')
        _Files.save_img_with_pdf2image(filename_after_upload, docserver_path + filename.replace('.pdf', '.jpg'))
        img_wdith = str(_Files.get_width(docserver_path + tmp_filename))
        file_content = verifier.get_file_content('positions_masks', tmp_filename, 'image/jpeg')
        nb_pages = _Files.get_pages(docservers['ERROR_PATH'], filename_after_upload)

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
            'file': str(base64.b64encode(file_content.get_data()).decode('UTF-8')),
            'width': img_wdith,
            'filename': tmp_filename,
            'nb_pages': nb_pages
        }), 200
    else:
        return '', 401
