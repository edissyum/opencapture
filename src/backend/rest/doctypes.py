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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask_babel import gettext
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, doctypes, privileges

bp = Blueprint('doctypes', __name__, url_prefix='/ws/')


@bp.route('doctypes/list', defaults={'form_id': None}, methods=['GET'])
@bp.route('doctypes/list/<int:form_id>', methods=['GET'])
@auth.token_required
def retrieve_doctypes(form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter | document_type_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/doctypes/list/{form_id}'}), 403

    args = {}
    if form_id:
        args = {
            'where': ['form_id = %s', 'status <> %s'],
            'data': [form_id, 'DEL']
        }
    res = doctypes.retrieve_doctypes(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('doctypes/add', methods=['POST'])
@auth.token_required
def add_doctype():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_document_type']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/doctypes/add'}), 403

    data = json.loads(request.data)
    res = doctypes.add_doctype(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('doctypes/update', methods=['POST'])
@auth.token_required
def update_doctype():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'document_type_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/doctypes/update'}), 403

    data = json.loads(request.data)
    res = doctypes.update(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('doctypes/generateSeparator', methods=['POST'])
@auth.token_required
def generate_separator():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'separator_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/doctypes/generateSeparator'}), 403

    data = json.loads(request.data)
    res = doctypes.generate_separator(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('doctypes/clone/<int:src_form_id>/<int:dest_form_id>', methods=['GET'])
@auth.token_required
def clone_form_doctypes(src_form_id, dest_form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/doctypes/generateSeparator'}), 403

    res = doctypes.clone_form_doctypes(src_form_id, dest_form_id)
    return make_response(jsonify(res[0])), res[1]
