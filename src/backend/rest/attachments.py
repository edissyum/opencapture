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
from src.backend.controllers import auth, privileges, attachments

bp = Blueprint('attachments', __name__, url_prefix='/ws/')

@bp.route('attachments/verifier/upload', methods=['POST'])
@auth.token_required
def upload_verifier():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'upload_attachments']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/attachments/verifier/upload'}), 403

    check, message = rest_validator(request.form, [
        {'id': 'documentId', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = attachments.handle_uploaded_file(request.files, request.form['documentId'])
    return make_response(res[0], res[1])

@bp.route('attachments/verifier/list/<int:document_id>', methods=['GET'])
@auth.token_required
def get_attachments_by_document_id(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'attachments_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/attachments/verifier/{document_id}'}), 403

    _attachments = attachments.get_attachments_by_document_id(document_id)
    return make_response(jsonify(_attachments[0])), _attachments[1]