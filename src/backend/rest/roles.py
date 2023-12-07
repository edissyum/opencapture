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
# @dev : Oussama BRICH <oussama.brich@edissyum.com>

from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, roles, privileges

bp = Blueprint('roles', __name__, url_prefix='/ws/')


@bp.route('roles/list/user/<int:user_id>', methods=['GET'])
@auth.token_required
def get_roles(user_id):
    check, message = rest_validator(request.args, [
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    args = {
        'user_id': user_id,
        'offset': request.args['offset'] if 'offset' in request.args else 0,
        'limit': request.args['limit'] if 'limit' in request.args else 'ALL',
        'full': 'full' in request.args
    }
    _roles = roles.get_roles(args)
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

    check, message = rest_validator(request.json['args'], [
        {'id': 'label', 'type': str, 'mandatory': True},
        {'id': 'enabled', 'type': bool, 'mandatory': False},
        {'id': 'label_short', 'type': str, 'mandatory': True},
        {'id': 'default_route', 'type': str, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = roles.update_role(role_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('roles/updatePrivilege/<int:role_id>', methods=['PUT'])
@auth.token_required
def update_privilege(role_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_role | add_role']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/roles/updatePrivilege/{role_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'privileges', 'type': list, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = roles.update_role_privilege(role_id, request.json['privileges'])
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

    check, message = rest_validator(request.json['args'], [
        {'id': 'label', 'type': str, 'mandatory': True},
        {'id': 'label_short', 'type': str, 'mandatory': True},
        {'id': 'default_route', 'type': str, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = roles.create_role(request.json['args'])
    return make_response(jsonify(res[0])), res[1]
