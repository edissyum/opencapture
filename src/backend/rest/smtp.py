# This file is part of Open-Capture.
from gettext import gettext

import requests
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

from src.backend.import_controllers import smtp
from flask import Blueprint, make_response, request

bp = Blueprint('smtp', __name__, url_prefix='/ws/')


@bp.route('smtp/isServerUp', methods=['GET'])
def check_smtp_status():
    status = smtp.check_smtp_status()
    return make_response({'status': status}, 200)


@bp.route('smtp/test', methods=['POST'])
def test_smtp_send():
    res = ('', 400)
    if 'email' in request.json and request.json['email'] is not None:
        res = smtp.test_send(request.json['email'])
    return make_response(res[0], res[1])
