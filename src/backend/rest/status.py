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
from flask import Blueprint, make_response, jsonify, request
from src.backend.import_controllers import auth, status, privileges


bp = Blueprint('status', __name__, url_prefix='/ws/')


@bp.route('status/<string:module>/list', methods=['GET'])
@auth.token_required
def status_list(module):
    list_priv = ['access_verifier | update_status'] if module == 'verifier' else ['access_splitter | update_status_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/status/{module}/list'}), 403

    _status = status.get_status(module)
    return make_response(jsonify(_status[0])), _status[1]

