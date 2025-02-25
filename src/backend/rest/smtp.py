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
from src.backend.controllers import smtp
from src.backend.functions import rest_validator
from flask import Blueprint, make_response, request

bp = Blueprint('smtp', __name__, url_prefix='/ws/')


@bp.route('smtp/isServerUp', methods=['GET'])
def check_smtp_status():
    status = smtp.check_smtp_status()
    return make_response({'status': status}, 200)


@bp.route('smtp/test', methods=['POST'])
def test_smtp_send():
    check, message = rest_validator(request.json, [
        {'id': 'email', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = smtp.test_send(request.json['email'])
    return make_response(res[0], res[1])
