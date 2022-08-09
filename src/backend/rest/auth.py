# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Essaid MEGHELLET <essaid.meghellet@edissyum.com>

import json
import uuid
import ldap3
import psycopg2
from ldap3 import Server
from flask_babel import gettext
from ldap3.core.exceptions import LDAPException
from werkzeug.security import generate_password_hash
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
                            ldap_configurations = configs[0]['ldap_configurations']
                            data_ldap_configs = ldap_configurations[0]['data']
                            type_ad = data_ldap_configs['typeAD']
                            domain_ldap = data_ldap_configs['host']
                            port_ldap = data_ldap_configs['port']
                            username_ldap_admin = data_ldap_configs['loginAdmin']
                            password_ldap_admin = data_ldap_configs['passwordAdmin']
                            base_dn = data_ldap_configs['baseDN']
                            suffix = data_ldap_configs['suffix'] if 'suffix' in data_ldap_configs else ''
                            prefix = data_ldap_configs['prefix'] if 'prefix' in data_ldap_configs else ''
                            username_attribute = data_ldap_configs['attributSourceUser']

                            user_connection_status = ldap_connection_bind(type_ad, domain_ldap, port_ldap,
                                                                          username_ldap_admin, password_ldap_admin, base_dn,
                                                                          suffix, prefix, username_attribute,
                                                                          data['username'], data['password'])
                            if user_connection_status:
                                res = auth.login(data['username'], None, data['lang'], 'ldap')
                            else:
                                res = [{
                                    "errors": gettext('LDAP_CONNECTION_ERROR'),
                                    "message": gettext('LOGIN_LDAP_ERROR')
                                }, 401]
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


def ldap_connection_bind(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix,
                         prefix, username_attribute, username, password):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldsp_server, get_info=ldap3.ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_dn, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, password)
                        if not connection_status:
                            return False
                        else:
                            return True
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ldap3.ALL)
            if prefix or suffix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_dn, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn,
                                                                       password)
                        if not connection_status:
                            return False
                        else:
                            return True
    except LDAPException:
        return False


def check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, user_password):
    if not user_dn and not user_password:
        return False
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            server = Server(ldsp_server, get_info=ldap3.ALL, use_ssl=True)
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ldap3.ALL)
        with ldap3.Connection(server, authentication="SIMPLE", user=user_dn, password=user_password, auto_bind=True) as connection:
            if connection.bind() and connection.result["description"] == 'success':
                return True
            else:
                return False

    except LDAPException:
        return False


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
        type_ad = server_ldap_data['typeAD']
        domain_ldap = server_ldap_data['host']
        port_ldap = server_ldap_data['port']
        username_ldap_admin = server_ldap_data['loginAdmin']
        password_ldap_admin = server_ldap_data['passwordAdmin']
        base_dn = server_ldap_data['baseDN']
        suffix = server_ldap_data['suffix'] if 'suffix' in server_ldap_data else ''
        prefix = server_ldap_data['prefix'] if 'prefix' in server_ldap_data else ''

        if type_ad and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_dn:
            ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
            try:
                if type_ad == 'openLDAP':
                    username_admin = f'cn={username_ldap_admin},{base_dn}'
                    server = Server(ldsp_server, get_info=ldap3.ALL, use_ssl=True)
                    with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True,
                                          receive_timeout=10) as connection:
                        if not connection.bind():
                            error = gettext('BAD_CONNECTION_LDAP_INFOS')
                            res = [{
                                "errors": gettext('LDAP_CONNECTION_ERROR'),
                                "message": error
                            }, 401]
                        else:
                            res = ['', 200]
                elif type_ad == 'adLDAP':
                    server = Server(ldsp_server, get_info=ldap3.ALL)
                    if prefix or suffix:
                        username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
                    with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True,
                                          receive_timeout=10) as connection:
                        if not connection.bind():
                            error = gettext('BAD_CONNECTION_LDAP_INFOS')
                            res = [{
                                "errors": gettext('LDAP_CONNECTION_ERROR'),
                                "message": error
                            }, 401]
                        else:
                            res = ['', 200]

            except ldap3.core.exceptions.LDAPInvalidServerError:
                error = gettext('BAD_CONNECTION_LDAP_INFOS')
                res = [{
                    "errors": gettext('LDAP_CONNECTION_ERROR'),
                    "message": error
                }, 401]
            except LDAPException as error:
                res = [{
                    "errors": gettext('LDAP_CONNECTION_ERROR'),
                    "message": str(error)
                }, 401]
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


def check_database_users(ldap_users_data, default_role):
    try:
        users_list = user_controller.get_users({'where': ["status <> 'DEL'"]})[0]
        oc_users = []
        create_users = 0
        update_users = 0
        disabled_users = 0
        if users_list:
            for user in users_list['users']:
                oc_users.append([user['username'], user['firstname'], user['lastname'], user['id']])

        for ldap_user in ldap_users_data:
            for oc_user in oc_users:
                if ldap_user[0] == oc_user[0]:
                    if ldap_user[1] == oc_user[1] and ldap_user[2] == oc_user[2]:
                        user_status = user_controller.get_user_by_username(oc_user[0])
                        if not user_status[0]['enabled']:
                            user_controller.enable_user(oc_user[0])
                            ldap_user[0] = 'Updated'
                            oc_user[0] = 'Updated'
                            update_users += 1
                        ldap_user[0] = 'Same'
                        oc_user[0] = 'Same'
                    elif ldap_user[0] != 'Same' and oc_user[0] != 'Same':
                        if (ldap_user[1] != oc_user[1] and ldap_user[2] != oc_user[2]) or (ldap_user[1] != oc_user[1]
                                       and ldap_user[2] == oc_user[2]) or (ldap_user[1] == oc_user[1]
                                       and ldap_user[2] != oc_user[2]):
                            user_controller.update_user(oc_user[3], {
                                'firstname': ldap_user[1],
                                'lastname': ldap_user[2],
                                'role': default_role,
                            })
                            ldap_user[0] = 'Updated'
                            oc_user[0] = 'Updated'
                            update_users += 1
                else:
                    continue

        for oc_user in oc_users:
            if oc_user[0] != 'Same' and oc_user[0] != 'Updated':
                user_info = user_controller.get_user_by_username(oc_user[0])
                if user_info[0] and user_info[0]['enabled']:
                    user_role = auth.get_user_role_by_username(oc_user[0])
                    if user_role != 'superadmin':
                        user_controller.disable_user(oc_user[0])
                        disabled_users += 1
                    else:
                        continue
        for user_to_create in ldap_users_data:
            if user_to_create[0] != 'Same' and user_to_create[0] != 'Updated':
                user_controller.create_user({
                    'username': user_to_create[0],
                    'firstname': user_to_create[1],
                    'lastname': user_to_create[2],
                    'role': default_role,
                    'password': generate_password_hash(str(uuid.uuid4())),
                    'customers': {}
                })
                user_to_create[0] = 'Created'
                create_users += 1
        return {'create_users': create_users, 'disabled_users': disabled_users, 'update_users': update_users}
    except (psycopg2.OperationalError, psycopg2.ProgrammingError) as err:
        return str(err).split('\n', maxsplit=1)[0]


def connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldsp_server, get_info=ldap3.ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ldap3.ALL)
            if suffix or prefix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
    except LDAPException:
        return {'status_server_ldap': False, 'connection_object': None}


@bp.route('auth/ldapSynchronization', methods=['POST'])
def ldap_synchronization_users():
    ldap_synchronization_data = json.loads(request.data.decode("utf8"))
    if ldap_synchronization_data:
        attribut_source_user = ldap_synchronization_data['attributSourceUser']
        class_object = ldap_synchronization_data['classObject']
        class_user = ldap_synchronization_data['classUser']
        attribut_first_name = ldap_synchronization_data['attributFirstName']
        attribut_last_name = ldap_synchronization_data['attributLastName']
        attribut_role_default = ldap_synchronization_data['attributRoleDefault']
        users_dn = ldap_synchronization_data['usersDN'] if 'usersDN' in ldap_synchronization_data else ''

        type_ad = ldap_synchronization_data['typeAD']
        domain_ldap = ldap_synchronization_data['host']
        port_ldap = ldap_synchronization_data['port']
        username_ldap_admin = ldap_synchronization_data['loginAdmin']
        password_ldap_admin = ldap_synchronization_data['passwordAdmin']
        base_dn = ldap_synchronization_data['baseDN']
        suffix = ldap_synchronization_data['suffix'] if 'suffix' in ldap_synchronization_data else ''
        prefix = ldap_synchronization_data['prefix'] if 'prefix' in ldap_synchronization_data else ''

        if type_ad and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_dn:
            ldap_connection = connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin,
                                              base_dn, suffix, prefix)
            if attribut_source_user and class_user and class_object and attribut_first_name and attribut_last_name and attribut_role_default:
                if ldap_connection['status_server_ldap']:
                    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], class_user, class_object, users_dn,
                                                     base_dn)
                    if list_ldap_users and list_ldap_users['status_search'] is True:
                        ldap_users_data = get_ldap_users_data(list_ldap_users, attribut_source_user, attribut_first_name,
                                                              attribut_last_name)
                        if ldap_users_data and ldap_users_data['status_search']:
                            result = check_database_users(ldap_users_data['ldap_users_data'], attribut_role_default)
                            res = [result, 200]
                        else:
                            res = [{
                                "errors": gettext('LDAP_SYNCHRO_ERROR'),
                                "message": gettext('LDAP_SYNCHRO_INFOS_ERROR')
                            }, 401]

                    else:
                        res = [{
                            "errors": gettext('LDAP_SYNCHRO_ERROR'),
                            "message": gettext('LDAP_SYNCHRO_INFOS_ERROR')
                        }, 401]

                else:
                    res = [{
                        "errors": gettext('LDAP_SYNCHRO_ERROR'),
                        "message":  gettext('LDAP_CONNECTION_ERROR')
                    }, 401]
            else:
                res = [{
                    "errors": gettext('LDAP_SYNCHRO_ERROR'),
                    "message": gettext('INFOS_LDAP_NOT_COMPLETE')
                }, 401]

        else:
            res = [{
                "errors": gettext('LDAP_SYNCHRO_ERROR') ,
                "message": gettext('INFOS_LDAP_NOT_COMPLETE')
            }, 401]
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
