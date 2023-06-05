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
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, roles, privileges

bp = Blueprint('roles', __name__, url_prefix='/ws/')


@bp.route('roles/list', methods=['GET'])
@auth.token_required
def get_roles():
    if not privileges.has_privileges(request.environ['user_id'],
                                     ['settings', 'roles_list | add_user | users_list | login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/roles/list'}), 403

    _roles = roles.get_roles(request.args)
    return make_response(jsonify(_roles[0])), _roles[1]


@bp.route('roles/getById/<int:role_id>', methods=['GET'])
@auth.token_required
def get_role_by_id(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/getById/{role_id}'}), 403

    _role = roles.get_role_by_id(role_id)
    return make_response(jsonify(_role[0])), _role[1]


@bp.route('roles/update/<int:role_id>', methods=['PUT'])
@auth.token_required
def update_role(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/update/{role_id}'}), 403

    data = request.json['args']
    res = roles.update_role(role_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/updatePrivilege/<int:role_id>', methods=['PUT'])
@auth.token_required
def update_privilege(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role | add_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/updatePrivilege/{role_id}'}), 403

    data = request.json['privileges']
    res = roles.update_role_privilege(role_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/delete/<int:role_id>', methods=['DELETE'])
@auth.token_required
def delete_role(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'roles_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/delete/{role_id}'}), 403

    res = roles.delete_role(role_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/disable/<int:role_id>', methods=['PUT'])
@auth.token_required
def disable_role(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'roles_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/disable/{role_id}'}), 403

    res = roles.disable_role(role_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/enable/<int:role_id>', methods=['PUT'])
@auth.token_required
def enable_role(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'roles_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/enable/{role_id}'}), 403

    res = roles.enable_role(role_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/create', methods=['POST'])
@auth.token_required
def create_role():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/roles/create'}), 403

    data = request.json['args']
    res = roles.create_role(data)
    return make_response(jsonify(res[0])), res[1]
