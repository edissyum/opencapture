# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import base64
import os

from src.backend.main import create_classes_from_config
from ..import_controllers import auth, positions_masks, verifier
from flask import Blueprint, request, make_response, jsonify, current_app


bp = Blueprint('positions_masks', __name__, url_prefix='/ws/')


@bp.route('positions_masks/list', methods=['GET'])
@auth.token_required
def get_positions_masks():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'where': ["status <> 'DEL'"]
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


@bp.route('positions_masks/getImageFromPdf/<int:positions_mask_id>', methods=['POST'])
@auth.token_required
def get_image_from_pdf(positions_mask_id):
    _vars = create_classes_from_config()
    _config = _vars[1]
    _Files = _vars[3]
    file = request.files
    path = current_app.config['UPLOAD_FOLDER']
    docserver_path = _config.cfg['GLOBAL']['positionsmaskspath'] + '/'
    file_content = tmp_filename = img_wdith = nb_pages = None

    for filename in file:
        f = file[filename]
        filename_after_upload = _Files.save_uploaded_file(f, path)
        tmp_filename = filename.replace('.pdf', '-001.jpg')
        _Files.save_img_with_wand(filename_after_upload, docserver_path + filename.replace('.pdf', '-%03d.jpg'))
        img_wdith = str(_Files.get_width(docserver_path + tmp_filename))
        file_content = verifier.get_file_content(docserver_path, tmp_filename, 'image/jpeg')
        nb_pages = _Files.get_pages(filename_after_upload, _config)

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
