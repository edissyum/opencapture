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
from src.backend.controllers import auth, opencrm
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('opencrm', __name__, url_prefix='/ws/')


@bp.route('opencrm/getAccessToken', methods=['POST'])
@auth.token_required
def get_access_token():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'client_id', 'type': str, 'mandatory': True},
        {'id': 'client_secret', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    connection = opencrm.get_access_token(request.json['args'])
    return make_response(jsonify({'status': connection}), 200)
