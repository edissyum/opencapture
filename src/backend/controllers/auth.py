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


import jwt
import json
import psycopg2
import datetime
import functools
import uuid
import ldap3
from . import privileges
from flask_babel import gettext
from src.backend.import_models import auth, user, roles
from flask import request, session, jsonify, current_app
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from ldap3 import Server, ALL
from ldap3.core.exceptions import LDAPException
from werkzeug.security import generate_password_hash


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


def encode_auth_token(user_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    configurations = _vars[10]
    minutes_before_exp = int(configurations['jwtExpiration'])

    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=minutes_before_exp),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'].replace("\n", ""),
            algorithm='HS512'
        ), minutes_before_exp
    except Exception as _e:
        return str(_e)


def logout():
    for key in list(session.keys()):
        session.pop(key)


def login(username, password, lang, method='default'):
    if 'SECRET_KEY' not in current_app.config or not current_app.config['SECRET_KEY']:
        return {
            "errors": gettext('LOGIN_ERROR'),
            "message": 'missing_secret_key'
        }, 401

    session['lang'] = lang
    error = None
    user_info = None

    if method == 'default':
        user_info, error = auth.login({
            'username': username,
            'password': password
        })
    elif method == 'ldap':
        user_info, error = user.get_user_by_username({"select": ['users.id', 'users.username'], "username": username})

    if error is None:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

        encoded_token = encode_auth_token(user_info['username'])
        if configurations['allowUserMultipleLogin'] is not True:
            last_connection = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            user.update_user({'set': {'last_connection': last_connection}, 'user_id': user_info['id']})

        returned_user = user.get_user_by_id({
            'select': ['users.id', 'username', 'firstname', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled'],
            'user_id': user_info['id']
        })[0]

        user_privileges = privileges.get_privileges_by_role_id({'role_id': returned_user['role']})
        if user_privileges:
            returned_user['privileges'] = user_privileges[0]

        user_role = roles.get_role_by_id({'role_id': returned_user['role']})
        if user_role:
            returned_user['role'] = user_role[0]

        response = {
            'auth_token': str(encoded_token[0]),
            'minutes_before_exp': encoded_token[1],
            'user': returned_user
        }
        return response, 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def login_with_token(token, lang):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    configurations = _vars[10]
    minutes_before_exp = configurations['jwtExpiration']
    session['lang'] = lang
    error = None

    try:
        decoded_token = jwt.decode(str(token), current_app.config['SECRET_KEY'].replace("\n", ""), algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        return jsonify({"errors": gettext("JWT_ERROR"), "message": str(_e)}), 500

    if error is None:
        returned_user = user.get_user_by_username({
            'select': ['users.id', 'username', 'firstname', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled'],
            'username': decoded_token['sub']
        })[0]

        user_privileges = privileges.get_privileges_by_role_id({'role_id': returned_user['role']})
        if user_privileges:
            returned_user['privileges'] = user_privileges[0]

        user_role = roles.get_role_by_id({'role_id': returned_user['role']})
        if user_role:
            returned_user['role'] = user_role[0]

        response = {
            'auth_token': str(token),
            'minutes_before_exp': minutes_before_exp,
            'user': returned_user
        }
        return response, 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def token_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split('Bearer')[1].lstrip()
            try:
                token = jwt.decode(str(token), current_app.config['SECRET_KEY'].replace("\n", ""), algorithms="HS512")
            except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
                    jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": str(_e)}), 500

            user_info, _ = user.get_user_by_username({
                'select': ['users.id', 'last_connection'],
                'username': token['sub']
            })

            if user_info['last_connection'] and token['iat'] < datetime.datetime.timestamp(user_info['last_connection']):
                return jsonify({"errors": gettext("JWT_ERROR"), "message": gettext('ACCOUNT_ALREADY_LOGGED')}), 500

            if not user_info:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": "User doesn't exist"}), 500
        else:
            return jsonify({"errors": gettext("JWT_ERROR"), "message": "Valid token is mandatory"}), 500
        return view(**kwargs)
    return wrapped_view


def get_user_role_by_username(username):
    user_role, error = auth.get_user_role_by_username(username)
    if error is None:
        return user_role
    else:
        return False


def verify_user_by_username(username):
    is_user_exists, error = auth.verify_user_by_username(username)
    if error is None and is_user_exists:
        return is_user_exists, 200
    else:
        response = {
            "error": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def get_enabled_login_method():
    login_methods_name, error = auth.get_enabled_login_method()
    if error is None:
        if len(login_methods_name) > 1:
            return {
                "errors": gettext('LOGIN_ERROR'),
                "message": gettext('SEVERAL_AUTH_METHODS_ENABLED')
            }, 401

        response = {
            "login_method_name": login_methods_name
        }
        return response, 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def get_ldap_configurations():
    data, error = auth.get_ldap_configurations()
    if error is None:
        response = {
            "ldap_configurations": data
        }
        return response, 200
    else:
        response = {
            "errors": gettext('LDAP_ERROR'),
            "message": gettext('NO_LDAP_CONFIGURATIONS_FOUND')
        }
        return response, 401


def update_login_method(login_method_name , server_data):
    _, error = auth.update_login_method(login_method_name, server_data)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def retrieve_login_methods():
    login_methods, error = auth.retrieve_login_methods()
    if error is None:
        response = {
            "login_methods": login_methods
        }
        return response, 200

    response = {
        "errors": gettext('LOADING_METHODS_AUTH_ERROR'),
        "message": error
    }
    return response, 401


def disable_login_method(method_name):
    _, error = auth.disable_login_method(method_name)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('DISABLE_LOGIN_METHOD_ERROR'),
            "message": error
        }
        return response, 401


def enable_login_method(method_name):
    _, error = auth.enable_login_method(method_name)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('ENABLE_LOGIN_METHOD_ERROR'),
            "message": error
        }
        return response, 401


def ldap_connection_bind(ldap_configs, data):
    ldap_configurations = ldap_configs[0]['ldap_configurations']
    data_ldap_configs = ldap_configurations[0]['data']

    type_AD = data_ldap_configs['typeAD']
    domain_ldap = data_ldap_configs['host']
    port_ldap = data_ldap_configs['port']
    username_ldap_admin = data_ldap_configs['loginAdmin']
    password_ldap_admin = data_ldap_configs['passwordAdmin']
    base_DN = data_ldap_configs['baseDN']
    suffix = data_ldap_configs['suffix'] if 'suffix' in data_ldap_configs else ''
    prefix = data_ldap_configs['prefix'] if 'prefix' in data_ldap_configs else ''
    usernameAttribute = data_ldap_configs['attributSourceUser']
    user_connection_status = check_user_connection(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix, usernameAttribute, data['username'], data['password'])
    if user_connection_status:
        res = login(data['username'], None, data['lang'], 'ldap')
    else:
        res = [{
            "errors": gettext('LDAP_CONNECTION_ERROR'),
            "message": gettext('LOGIN_LDAP_ERROR')
        }, 401]

    return res


def check_user_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix, username_attribute, username, password):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
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
                        if not connection_status :
                            return False
                        else:
                            return True
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
            if prefix or suffix :
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
                        connection_status = check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, password)
                        if not connection_status:
                            return False
                        else:
                            return True

    except LDAPException:
        return False


def verify_ldap_server_connection(server_ldap_data):

    type_AD = server_ldap_data['typeAD']
    domain_ldap = server_ldap_data['host']
    port_ldap = server_ldap_data['port']
    username_ldap_admin = server_ldap_data['loginAdmin']
    password_ldap_admin = server_ldap_data['passwordAdmin']
    base_DN = server_ldap_data['baseDN']
    suffix = server_ldap_data['suffix'] if 'suffix' in server_ldap_data else ''
    prefix = server_ldap_data['prefix'] if 'prefix' in server_ldap_data else ''

    ldap_connection_status, error = ldap_server_connection(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix)
    if error is None:
       response = ['', 200]
    else:
        response = [error, 401]

    return response


def synchronization_ldap_users(ldap_synchronization_data):
    ldap_synchronization_result, error = ldap_users_synchro(ldap_synchronization_data)

    if error is None:
        response = [ldap_synchronization_result, 200]
    else:
        response = [error, 401]

    return response


def connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
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


def check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_DN, user_password):
    if not user_DN and not user_password:
        return False
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
        with ldap3.Connection(server, authentication="SIMPLE", user=user_DN, password=user_password, auto_bind=True) as connection:
            if connection.bind() and connection.result["description"] == 'success':
                return True
            else :
                return False

    except LDAPException:
        return False


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



def ldap_users_synchro(ldap_synchronization_data):
    error = None
    result_synchro = None
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
            ldap_connection = connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix)
            if attribut_source_user and class_user and class_object and attribut_first_name and attribut_last_name and attribut_role_default:
                if ldap_connection['status_server_ldap']:
                    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], class_user, class_object, users_dn,
                                                     base_dn)
                    if list_ldap_users and list_ldap_users['status_search'] is True:
                        ldap_users_data = get_ldap_users_data(list_ldap_users, attribut_source_user, attribut_first_name,
                                                              attribut_last_name)
                        if ldap_users_data and ldap_users_data['status_search']:
                            result_synchro = check_database_users(ldap_users_data['ldap_users_data'], attribut_role_default)
                        else:
                            error_message = gettext('LDAP_SYNCHRO_INFOS_ERROR')
                            error = {
                                "errors": gettext('LDAP_SYNCHRO_ERROR'),
                                "message": error_message
                            }
                    else:
                        error_message = gettext('LDAP_SYNCHRO_INFOS_ERROR')
                        error = {
                            "errors": gettext('LDAP_SYNCHRO_ERROR'),
                            "message": error_message
                        }
                else:
                    error_message = gettext('LDAP_CONNECTION_ERROR')
                    error = {
                        "errors": gettext('LDAP_SYNCHRO_ERROR'),
                        "message": error_message
                    }
            else:
                error_message = gettext('INFOS_LDAP_NOT_COMPLETE')
                error = {
                    "errors": gettext('LDAP_SYNCHRO_ERROR'),
                    "message": error_message
                }
        else:
            error_message = gettext('INFOS_LDAP_NOT_COMPLETE')
            error = {
                "errors": gettext('LDAP_SYNCHRO_ERROR'),
                "message": error_message
            }
    return result_synchro, error

def get_ldap_users_data(ldap_users_dict, user_id_attribut, firstname_attribut, lastname_attribut):
    try:
        if ldap_users_dict and ldap_users_dict['status_search'] == True:
            list_users_ldap = ldap_users_dict['ldap_users']
            ldap_users_data = []
            for i in range(len(list_users_ldap)):
                user_data = []
                user_id = list_users_ldap[i][user_id_attribut][0] if user_id_attribut in list_users_ldap[i] else ''
                givenname = list_users_ldap[i][firstname_attribut][0] if firstname_attribut in list_users_ldap[i] else ''
                lastname = list_users_ldap[i][lastname_attribut][0] if lastname_attribut in list_users_ldap[i] else ''
                if user_id and givenname and lastname:
                    user_data.append(user_id)
                    user_data.append(givenname)
                    user_data.append(lastname)
                    ldap_users_data.append(user_data)
            return {'status_search': True, 'ldap_users_data': ldap_users_data}
        else:
            return False
    except ldap3.core.exceptions.LDAPKeyError:
        return False


def ldap_server_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix):
    error = None
    ldap_connection_status = False
    if type_ad and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_dn:
        ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
        try:
            if type_ad == 'openLDAP':
                username_admin = f'cn={username_ldap_admin},{base_dn}'
                server = Server(ldsp_server, get_info=ALL, use_ssl=True)

                with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True,
                                      receive_timeout=10) as connection:
                    if not connection.bind():
                        error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
                        error = {
                            "errors": gettext('LDAP_CONNECTION_ERROR'),
                            "message": error_message
                        }
                    else:
                        ldap_connection_status = True
            elif type_ad == 'adLDAP':
                server = Server(ldsp_server, get_info=ALL)
                if prefix or suffix:
                    username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'

                with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True,
                                      receive_timeout=10) as connection:
                    if not connection.bind():
                        error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
                        error = {
                            "errors": gettext('LDAP_CONNECTION_ERROR'),
                            "message": error_message
                        }
                    else:
                        ldap_connection_status = True
        except ldap3.core.exceptions.LDAPInvalidServerError:
            error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
            error = {
                "errors": gettext('LDAP_CONNECTION_ERROR'),
                "message": error_message
            }

        except LDAPException as err:
            error = {
                "errors": gettext('LDAP_CONNECTION_ERROR'),
                "message": str(err)
            }
    else:
        error_message = gettext('NOT_COMPLETE_CONNECTION_INFOS')
        error = {
            "errors": gettext('INFOS_LDAP_NOT_COMPLETE'),
            "message": error_message
        }
    return ldap_connection_status , error





def check_database_users(ldap_users_data, default_role):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    oc_users = []
    create_users = 0
    update_users = 0
    disabled_users = 0

    users_list = user.get_users({
        'select': ['*'],
        'where': ['status <> %s'],
        'data': ['DEL']
    })[0]


    # active_users, _ = user.get_users({
    #     'select': ['id', 'username', 'count(*) OVER() as total'],
    #     'where': ['status NOT IN (%s)', "role <> 1"],
    #     'data': ['DEL']
    # })

    if users_list:
        for user_info in users_list:
            oc_users.append([user_info['username'], user_info['firstname'], user_info['lastname'], user_info['id']])
    for ldap_user in ldap_users_data:
        for oc_user in oc_users:
            if ldap_user[0] == oc_user[0]:
                if ldap_user[1] == oc_user[1] and ldap_user[2] == oc_user[2]:
                    user_status = user.get_users({
                        'select': ['enabled'],
                        'where': ['username = %s'],
                        'data': [oc_user[0]]
                    })[0]
                    print(user_status)
                    if not user_status:
                        user_id = user.get_user_by_username({
                            'select': ['users.id'],
                            'username': oc_user[0]
                        })[0]
                        print(user_id)
                        user.update_user({'set': {'enabled': True},'user_id': user_id})
                        # user.update_user({
                        #     'set': {'enabled': True},
                        #     'where': {'username = % s'},
                        #     'user_id': oc_user[0]
                        # })
                        # database.update({
                        #     'table': ['users'],
                        #     'set': {'enabled': True},
                        #     'where': ['username = %s'],
                        #     'data': [oc_user[0]]
                        # })
                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
                    ldap_user[0] = 'Same'
                    oc_user[0] = 'Same'
                elif ldap_user[0] != 'Same' and oc_user[0] != 'Same':
                    if (ldap_user[1] != oc_user[1] and ldap_user[2] != oc_user[2]) or (ldap_user[1] != oc_user[1] and ldap_user[2] == oc_user[2]) or (ldap_user[1] == oc_user[1] and ldap_user[2] != oc_user[2]):
                        user_id = user.get_user_by_username({
                            'select': ['users.id'],
                            'username': oc_user[0]
                        })[0]
                        user.update_user({
                            'set': {
                                'firstname': str(ldap_user[1]),
                                'lastname': str(ldap_user[2]),
                                'role': default_role,
                                'enabledN': True,
                            },
                            'user_id': user_id
                        })


                        # database.update({
                        #     'table': ['users'],
                        #     'set': {
                        #         'firstname': str(ldap_user[1]),
                        #         'lastname': str(ldap_user[2]),
                        #         'role': default_role,
                        #         'enabledN': True,
                        #     },
                        #     'where': ['username = %s'],
                        #     'data': [oc_user[0]]
                        # })
                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
            else:
                continue
    for oc_user in oc_users:
        if oc_user[0] != 'Same' and oc_user[0] != 'Updated':
            user_oc_status = user.get_users({
                'select': ['enabled'],
                'where': ['username = %s'],
                'data': [oc_user[0]]
            })[0]
            # user_oc_status = database.select({
            #     'select': ['enabled'],
            #     'table': ['users'],
            #     'where': ['username = %s'],
            #     'data': [oc_user[0]]
            # })[0]['enabled']
            if user_oc_status != '' and user_oc_status:
                is_user_superadmin = auth.get_user_role_by_username(oc_user[0])
                if is_user_superadmin[0] != 'superadmin':
                    user.update_user_ldap({
                        'set': {
                            'enabled': False,
                        },
                        'username': oc_user[0],
                        'role': 1
                    })
                    disabled_users += 1
                else:
                    continue
    for user_to_create in ldap_users_data:
        if user_to_create[0] != 'Same' and user_to_create[0] != 'Updated':
            random_password = str(uuid.uuid4())
            hash_password = generate_password_hash(random_password)

            user.create_user({
                'columns': {
                    'username': user_to_create[0],
                    'firstname': user_to_create[1],
                    'lastname': user_to_create[2],
                    'password': hash_password,
                    'role': default_role
                }
            })
            # database.insert({
            #     'table': 'users',
            #     'columns': {
            #         'username': user_to_create[0],
            #         'firstname': user_to_create[1],
            #         'lastname': user_to_create[2],
            #         'password': hash_password,
            #         'role': default_role
            #     }
            # })
            user_to_create[0] = 'Created'
            create_users += 1
    return {'create_users': create_users, 'disabled_users': disabled_users, 'update_users': update_users}
