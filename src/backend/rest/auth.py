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
from src.backend.import_controllers import auth, privileges
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    check, message = rest_validator(request.json, [
        {'id': 'lang', 'type': str, 'mandatory': True},
        {'id': 'token', 'type': str, 'mandatory': False},
        {'id': 'username', 'type': str, 'mandatory': False},
        {'id': 'password', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.handle_login(request.json)

    return make_response(res[0], res[1])


@bp.route('auth/login/refresh', methods=['POST'])
@auth.token_required
def refresh():
    check, message = rest_validator(request.json, [
        {'id': 'token', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.refresh(request.json['token'])
    return make_response(res[0], res[1])


@bp.route('auth/checkToken', methods=['POST'])
def check_token():
    check, message = rest_validator(request.json, [
        {'id': 'token', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.check_token(request.json['token'])
    return make_response(res[0], res[1])


@bp.route('auth/generateAuthToken', methods=['POST'])
@auth.token_required
def generate_auth_token():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations', 'generate_auth_token']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/generateAuthToken'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'token', 'type': str, 'mandatory': False},
        {'id': 'username', 'type': str, 'mandatory': True},
        {'id': 'expiration', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    if 'token' in request.json:
        _, code = auth.check_token(request.json['token'])
        if code == 200:
            return make_response({'token': request.json['token']}, 200)

    res = auth.generate_token(request.json['username'], request.json['expiration'])
    return make_response({'token': res[0]}, res[1])


@bp.route('auth/logout', methods=['GET'])
def logout():
    check, message = rest_validator(request.args, [
        {'id': 'user_id', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    user_id = request.args.get('user_id')

    auth.logout(user_id)
    return {}, 200


@bp.route('auth/getEnabledLoginMethod', methods=['GET'])
def get_enabled_login_method():
    res = auth.get_enabled_login_method()
    return make_response(res[0], res[1])


@bp.route('auth/retrieveLdapConfigurations', methods=['GET'])
@auth.token_required
def retrieve_ldap_configurations():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/retrieveLdapConfigurations'}), 403

    res = auth.get_ldap_configurations()
    return make_response(res[0], res[1])


@bp.route('auth/connectionLdap', methods=['POST'])
@auth.token_required
def check_connection_ldap_server():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/retrieveLdapConfigurations'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'typeAD', 'type': str, 'mandatory': True},
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'port', 'type': str, 'mandatory': True},
        {'id': 'loginAdmin', 'type': str, 'mandatory': True},
        {'id': 'passwordAdmin', 'type': str, 'mandatory': True},
        {'id': 'baseDN', 'type': str, 'mandatory': True},
        {'id': 'prefix', 'type': str, 'mandatory': False},
        {'id': 'suffix', 'type': str, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.verify_ldap_server_connection(request.json)
    return make_response(res[0], res[1])


@bp.route('auth/ldapSynchronization', methods=['POST'])
@auth.token_required
def ldap_synchronization_users():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/ldapSynchronization'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'port', 'type': str, 'mandatory': True},
        {'id': 'baseDN', 'type': str, 'mandatory': True},
        {'id': 'typeAD', 'type': str, 'mandatory': True},
        {'id': 'usersDN', 'type': str, 'mandatory': True},
        {'id': 'prefix', 'type': str, 'mandatory': False},
        {'id': 'suffix', 'type': str, 'mandatory': False},
        {'id': 'classUser', 'type': str, 'mandatory': True},
        {'id': 'loginAdmin', 'type': str, 'mandatory': True},
        {'id': 'classObject', 'type': str, 'mandatory': True},
        {'id': 'passwordAdmin', 'type': str, 'mandatory': True},
        {'id': 'attributLastName', 'type': str, 'mandatory': True},
        {'id': 'attributFirstName', 'type': str, 'mandatory': True},
        {'id': 'attributSourceUser', 'type': str, 'mandatory': True},
        {'id': 'attributRoleDefault', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.synchronization_ldap_users(request.json)
    return make_response(res[0], res[1])


@bp.route('auth/saveLoginMethodConfig', methods=['POST'])
@auth.token_required
def save_login_method():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/saveLoginMethodConfig'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'port', 'type': str, 'mandatory': True},
        {'id': 'typeAD', 'type': str, 'mandatory': True},
        {'id': 'baseDN', 'type': str, 'mandatory': True},
        {'id': 'prefix', 'type': str, 'mandatory': False},
        {'id': 'usersDN', 'type': str, 'mandatory': True},
        {'id': 'suffix', 'type': str, 'mandatory': False},
        {'id': 'classUser', 'type': str, 'mandatory': True},
        {'id': 'loginAdmin', 'type': str, 'mandatory': True},
        {'id': 'classObject', 'type': str, 'mandatory': True},
        {'id': 'passwordAdmin', 'type': str, 'mandatory': True},
        {'id': 'attributLastName', 'type': str, 'mandatory': True},
        {'id': 'attributFirstName', 'type': str, 'mandatory': True},
        {'id': 'attributSourceUser', 'type': str, 'mandatory': True},
        {'id': 'attributRoleDefault', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.update_login_method('ldap', request.json)
    return make_response(res[0], res[1])


@bp.route('auth/retrieveLoginMethodName', methods=['GET'])
def get_login_methods_name():
    res = auth.retrieve_login_methods()
    return make_response(res[0], res[1])


@bp.route('auth/disableLoginMethodName', methods=['POST'])
@auth.token_required
def disable_login_method():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/disableLoginMethodName'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'method_name', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.disable_login_method(request.json['method_name'])
    return make_response(res[0], res[1])


@bp.route('auth/enableLoginMethodName', methods=['POST'])
@auth.token_required
def enable_login_method():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'login_methods']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/auth/enableLoginMethodName'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'method_name', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = auth.enable_login_method(request.json['method_name'])
    return make_response(res[0], res[1])
