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
from src.backend.import_controllers import auth, privileges
from flask import Blueprint, make_response, jsonify, request

bp = Blueprint('privileges', __name__, url_prefix='/ws/')


@bp.route('privileges/list', methods=['GET'])
@auth.token_required
def get_privileges():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role | add_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/privileges/list'}), 403

    _privileges = privileges.get_privileges()
    return make_response(jsonify(_privileges[0])), _privileges[1]


@bp.route('privileges/getbyRoleId/<int:role_id>', methods=['GET'])
@auth.token_required
def get_privileges_by_role_id(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role | add_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/privileges/getbyRoleId/{role_id}'}), 403

    args = {'role_id': role_id}
    _privileges = privileges.get_privileges_by_role_id(args)
    return make_response(jsonify(_privileges[0])), _privileges[1]
