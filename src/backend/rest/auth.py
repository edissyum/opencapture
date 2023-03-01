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
# @dev : Essaid MEGHELLET <essaid.meghellet@edissyum.com>

import json
from flask_babel import gettext
from src.backend.import_controllers import auth
from flask import Blueprint, request, make_response

bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    login_method = auth.get_enabled_login_method()
    enabled_login_method_name = login_method[0]['login_method_name'] if login_method[0]['login_method_name'] else [{'method_name': 'default'}]
    res = auth.check_connection()
    data = request.json
    if enabled_login_method_name and enabled_login_method_name[0]['method_name'] == 'default':
        if res is None:
            if 'username' in data and 'password' in data:
                res = auth.login(data['username'], data['password'], data['lang'])
                if res[1] == 200 and data['username'] == 'admin' and data['password'] == 'admin':
                    res[0]['admin_password_alert'] = True
            elif 'token' in data:
                res = auth.login_with_token(data['token'], data['lang'])
            else:
                res = ('', 402)
        else:
            res = [{
                "errors": gettext('PGSQL_ERROR'),
                "message": res.replace('\n', '')
            }, 401]
    elif enabled_login_method_name and enabled_login_method_name[0]['method_name'] == 'ldap':
        if res is None:
            if 'token' in data:
                res = auth.login_with_token(data['token'], data['lang'])
            else:
                is_user_exists = auth.verify_user_by_username(data['username'])
                if is_user_exists and is_user_exists[1] == 200:
                    role_id = auth.get_user_role_by_username(data['username'])
                    if role_id and role_id == 'superadmin':
                        res = auth.login(data['username'], data['password'], data['lang'])
                    else:
                        configs = auth.get_ldap_configurations()
                        if configs and configs[0]['ldap_configurations']:
                            res = auth.ldap_connection_bind(configs, data)
                        else:
                            error = configs[0]['message']
                            res = [{
                                "errors": error,
                            }, 401]
                else:
                    res = [{
                        "errors": gettext('LOGIN_ERROR'),
                        "message": gettext('BAD_USERNAME')
                    }, 401]
        else:
            res = [{
                "errors": gettext('PGSQL_ERROR'),
                "message": res.replace('\n', '')
            }, 401]
    return make_response(res[0], res[1])


@bp.route('auth/checkToken', methods=['POST'])
def check_token():
    data = request.json
    res = auth.check_token(data['token'])
    return make_response(res[0], res[1])


@bp.route('auth/logout', methods=['GET'])
def logout():
    auth.logout()
    return {}, 200


@bp.route('auth/getEnabledLoginMethod', methods=['GET'])
def get_enabled_login_method():
    res = auth.get_enabled_login_method()
    return make_response(res[0], res[1])


@bp.route('auth/retrieveLdapConfigurations', methods=['GET'])
@auth.token_required
def retrieve_ldap_configurations():
    res = auth.get_ldap_configurations()
    return make_response(res[0], res[1])


@bp.route('auth/connectionLdap', methods=['POST'])
@auth.token_required
def check_connection_ldap_server():
    server_ldap_data = json.loads(request.data.decode("utf8"))
    if not server_ldap_data:
        pass
    if server_ldap_data:
        res = auth.verify_ldap_server_connection(server_ldap_data)
    else:
        error = gettext('NOT_COMPLETE_CONNECTION_INFOS')
        res = [{
            "errors": gettext('INFOS_LDAP_NOT_COMPLETE'),
            "message": gettext(error)
        }, 401]

    return make_response(res[0], res[1])


@bp.route('auth/ldapSynchronization', methods=['POST'])
@auth.token_required
def ldap_synchronization_users():
    ldap_synchronization_data = json.loads(request.data.decode("utf8"))
    res = auth.synchronization_ldap_users(ldap_synchronization_data)
    return make_response(res[0], res[1])


@bp.route('auth/saveLoginMethodConfigs', methods=['POST'])
@auth.token_required
def save_login_method():
    data = request.json
    login_method_name = 'ldap'
    res = auth.update_login_method(login_method_name, data)
    if not res:
        res = [{
            "errors": gettext('REQUEST_MODIFS_ERROR'),
            "message": res.replace('\n', '')
        }, 401]
    else:
        res = ['', 200]
    return make_response(res[0], res[1])


@bp.route('auth/retrieveLoginMethodName', methods=['GET'])
def get_login_methods_name():
    res = auth.retrieve_login_methods()
    if not res:
        res = [{
            "errors": gettext('RETRIEVE_LOGIN_METHODS_ERROR'),
            "message": res.replace('\n', '')
        }, 401]
    else:
        res = [res[0], 200]
    return make_response(res[0], res[1])


@bp.route('auth/disableLoginMethodName', methods=['POST'])
@auth.token_required
def disable_login_method():
    login_method_name = json.loads(request.data.decode("utf8"))
    res = auth.disable_login_method(login_method_name['method_name'])
    if not res:
        res = [{
            "errors": gettext('REQUEST_MODIFS_ERROR'),
            "message": res.replace('\n', '')
        }, 401]
    else:
        res = ['', 200]
    return make_response(res[0], res[1])


@bp.route('auth/enableLoginMethodName', methods=['POST'])
@auth.token_required
def enable_login_method():
    login_method_name = json.loads(request.data.decode("utf8"))
    res = auth.enable_login_method(login_method_name['method_name'])
    if not res:
        res = [{
            "errors": gettext('REQUEST_MODIFS_ERROR'),
            "message": res.replace('\n', '')
        }, 401]
    else:
        res = ['', 200]
    return make_response(res[0], res[1])
