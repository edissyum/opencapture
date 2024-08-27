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

import base64
from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.controllers import auth, privileges, attachments

bp = Blueprint('attachments', __name__, url_prefix='/ws/')

@bp.route('attachments/verifier/upload', methods=['POST'])
@auth.token_required
def upload_verifier():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'upload_attachments_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/attachments/verifier/upload'}), 403

    check, message = rest_validator(request.form, [
        {'id': 'documentId', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = attachments.handle_uploaded_file(request.files, request.form['documentId'], None, 'verifier')
    return make_response(res[0], res[1])

@bp.route('attachments/splitter/upload', methods=['POST'])
@auth.token_required
def upload_splitter():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter', 'upload_attachments_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/attachments/splitter/upload'}), 403

    check, message = rest_validator(request.form, [
        {'id': 'batchId', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = attachments.handle_uploaded_file(request.files, None, request.form['batchId'], 'splitter')
    return make_response(res[0], res[1])

@bp.route('attachments/verifier/list/<int:document_id>', methods=['GET'])
@auth.token_required
def get_attachments_by_document_id(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'attachments_list_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/verifier/{document_id}'}), 403

    _attachments = attachments.get_attachments_by_document_id(document_id)
    return make_response(jsonify(_attachments[0])), _attachments[1]

@bp.route('attachments/splitter/list/<int:batch_id>', methods=['GET'])
@auth.token_required
def get_attachments_by_batch_id(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter', 'attachments_list_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/splitter/{batch_id}'}), 403

    _attachments = attachments.get_attachments_by_batch_id(batch_id)
    return make_response(jsonify(_attachments[0])), _attachments[1]

@bp.route('attachments/verifier/download/<int:attachment_id>', methods=['POST'])
@auth.token_required
def download_attachment_verifier(attachment_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'attachments_list_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/verifier/download/{attachment_id}'}), 403

    file_content, mime = attachments.download_attachment(attachment_id)
    if file_content is None:
        return make_response({'errors': gettext('DOWNLOAD_FILE'), 'message': gettext('FILE_NOT_FOUND')}, 404)
    return make_response({'file': str(base64.b64encode(file_content).decode('utf-8')), 'mime': mime}), 200

@bp.route('attachments/splitter/download/<int:attachment_id>', methods=['POST'])
@auth.token_required
def download_attachment_splitter(attachment_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter', 'attachments_list_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/splitter/download/{attachment_id}'}), 403

    file_content, mime = attachments.download_attachment(attachment_id)
    if file_content is None:
        return make_response({'errors': gettext('DOWNLOAD_FILE'), 'message': gettext('FILE_NOT_FOUND')}, 404)
    return make_response({'file': str(base64.b64encode(file_content).decode('utf-8')), 'mime': mime}), 200

@bp.route('attachments/verifier/delete/<int:attachment_id>', methods=['DELETE'])
@auth.token_required
def delete_attachment_verifier(attachment_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'attachments_list_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/verifier/delete/{attachment_id}'}), 403

    _attachments = attachments.delete_attachment(attachment_id, 'verifier')
    return make_response(jsonify(_attachments[0])), _attachments[1]

@bp.route('attachments/splitter/delete/<int:attachment_id>', methods=['DELETE'])
@auth.token_required
def delete_attachment_splitter(attachment_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter', 'attachments_list_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/splitter/delete/{attachment_id}'}), 403

    _attachments = attachments.delete_attachment(attachment_id, 'splitter')
    return make_response(jsonify(_attachments[0])), _attachments[1]
