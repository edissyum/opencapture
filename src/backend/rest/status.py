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
from src.backend.controllers import auth, status, privileges


bp = Blueprint('status', __name__, url_prefix='/ws/')


@bp.route('status/<string:module>/list', methods=['GET'])
@auth.token_required
def status_list(module):
    list_priv = ['access_verifier | update_status'] if module == 'verifier' else \
        ['access_splitter | update_status_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/status/{module}/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'time', 'type': str, 'mandatory': False},
        {'id': 'totals', 'type': bool, 'mandatory': False},
        {'id': 'user_id', 'type': int, 'mandatory': False},
        {'id': 'form_id', 'type': int, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    args = request.args
    _status = status.get_status(args, module)
    return make_response(jsonify(_status[0])), _status[1]
