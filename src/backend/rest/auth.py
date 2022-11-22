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
import ldap3
import psycopg2
from flask_babel import gettext
from ldap3.core.exceptions import LDAPException
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, request, make_response, session
from src.backend.import_controllers import auth, user as user_controller

bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    login_method = auth.get_enabled_login_method()
    enabled_login_method_name = login_method[0]['login_method_name']
    res = check_connection()
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


@bp.route('auth/logout', methods=['GET'])
def logout():
    auth.logout()
    return {}, 200


def check_connection():
    if 'config' in session:
        config = json.loads(session['config'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]
    db_user = config['DATABASE']['postgresuser']
    db_host = config['DATABASE']['postgreshost']
    db_port = config['DATABASE']['postgresport']
    db_pwd = config['DATABASE']['postgrespassword']
    db_name = config['DATABASE']['postgresdatabase']
    try:
        psycopg2.connect(
            "dbname     =" + db_name +
            " user      =" + db_user +
            " password  =" + db_pwd +
            " host      =" + db_host +
            " port      =" + db_port)
    except (psycopg2.OperationalError, psycopg2.ProgrammingError) as _e:
        return str(_e).split('\n', maxsplit=1)[0]


def check_user_ldap_account(connection, username, username_attribute, base_dn):
    ldap_user_login = username.strip()
    try:
        status = connection.search(search_base=base_dn, search_filter=f'({username_attribute}={ldap_user_login})',
                                   search_scope='SUBTREE',
                                   attributes=['*'])
        if status:
            return {'status_search': True, 'username_ldap': connection.entries[0][username_attribute]}
        else:
            return {'status_search': False, 'username_ldap': ""}
    except LDAPException:
        return False


@bp.route('auth/getEnabledLoginMethod', methods=['GET'])
def get_enabled_login_method():
    res = auth.get_enabled_login_method()
    return make_response(res[0], res[1])


@bp.route('auth/retrieveLdapConfigurations', methods=['GET'])
def retrieve_ldap_configurations():
    res = auth.get_ldap_configurations()
    return make_response(res[0], res[1])


@bp.route('auth/connectionLdap', methods=['POST'])
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
            "message": error
        }, 401]

    return make_response(res[0], res[1])


def get_ldap_users(connection, class_user, object_class, users_dn, base_dn):
    try:
        if not users_dn:
            status = connection.search(search_base=base_dn, search_filter=f'({class_user}={object_class})',
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        else:
            status = connection.search(search_base=users_dn, search_filter=f'({class_user}={object_class})',
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        if connection and status:
            return {'status_search': True, 'ldap_users': connection.entries}
        else:
            return {'status_search': False, 'ldap_users': ""}
    except LDAPException:
        return False


def get_ldap_users_data(ldap_users_dict, user_id_attribut, firstname_attribut, lastname_attribut):
    try:
        if ldap_users_dict and ldap_users_dict['status_search'] is True:
            list_users_ldap = ldap_users_dict['ldap_users']
            ldap_users_data = []
            for i in range(len(list_users_ldap)):
                user_data = []
                user_id = list_users_ldap[i][user_id_attribut][0] if user_id_attribut in list_users_ldap[i] else ''
                givenname = list_users_ldap[i][firstname_attribut][0] if firstname_attribut in list_users_ldap[i] else ''
                lastname = list_users_ldap[i][lastname_attribut][0] if lastname_attribut in list_users_ldap[i] else ''
                if user_id and givenname and lastname :
                    user_data.append(user_id)
                    user_data.append(givenname)
                    user_data.append(lastname)
                    ldap_users_data.append(user_data)
            return {'status_search': True, 'ldap_users_data': ldap_users_data}
        else:
            return False
    except ldap3.core.exceptions.LDAPKeyError:
        return False


@bp.route('auth/ldapSynchronization', methods=['POST'])
def ldap_synchronization_users():
    ldap_synchronization_data = json.loads(request.data.decode("utf8"))
    res = auth.synchronization_ldap_users(ldap_synchronization_data)
    return make_response(res[0], res[1])


@bp.route('auth/saveLoginMethodConfigs', methods=['POST'])
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


@bp.route('auth/retrieveLoginMethodName', methods=['POST'])
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
