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
import uuid
import os
import ldap3
from flask import request, session
from flask_babel import gettext
from werkzeug.security import check_password_hash
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id

from ldap3 import Server, ALL
from ldap3.core.exceptions import LDAPException
from werkzeug.security import generate_password_hash



def login(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    user = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [args['username']]
    })

    if not user:
        error = gettext('BAD_USERNAME')
    elif not check_password_hash(user[0]['password'], args['password']):
        error = gettext('BAD_PASSWORD')
    elif user[0]['status'] == 'DEL':
        error = gettext('USER_DELETED')
    elif user[0]['enabled'] == 0:
        error = gettext('USER_DISABLED')
    else:
        user = user[0]
    return user, error


def get_user_role_by_username(username):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    user_role_id = database.select({
        'select': ['role'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [username]
    })
    if not user_role_id:
        error = gettext('ROLE_DOESNT_EXISTS')
        return user_role_id, error
    else:
        user_role_label = database.select({
            'select': ['label_short'],
            'table': ['roles'],
            'where': ['id = %s'],
            'data': [user_role_id[0]['role']]
        })
        if not user_role_label:
            error = gettext('ROLE_DOESNT_EXISTS')

        return user_role_label[0]['label_short'], error


def verify_user_by_username(username):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    user_id = database.select({
        'select': ['id'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [username],
    })
    if not user_id:
        error = gettext('BAD_USERNAME')
        return False, error
    else:
        return True, error


def get_enabled_login_method():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    if not _vars[0]:
        return {}, _vars[1]
    database = _vars[0]
    error = None
    enabled_method_name = database.select({
        'select': ['method_name'],
        'table': ['login_methods'],
        'where': ['enabled = true'],
    })
    return enabled_method_name, error


def get_ldap_configurations():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    ldap_configurations = database.select({
        'select': ['data'],
        'table': ['login_methods'],
        'where': ['method_name = %s'],
        'data': ['ldap']
    })
    if not ldap_configurations or not ldap_configurations[0]['data']:
        error = gettext('NO_LDAP_CONFIGURATIONS_FOUND')

    return ldap_configurations, error


def update_login_method(login_method_name, server_data):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    login_method_data = database.update({
        'table': ['login_methods'],
        'set': {
            'data': json.dumps(server_data),
            'enabled': True,
        },
        'where': ['method_name = %s'],
        'data': [login_method_name]
    })

    if login_method_data[0] is False:
        error = gettext('UPDATE_LOGIN_METHOD_ERROR')
    if login_method_name[0]:
        database.update({
            'table': ['login_methods'],
            'set': {
                'enabled': False,
            },
            'where': ['method_name <> %s'],
            'data': [login_method_name]
        })
    return login_method_data, error


def retrieve_login_methods():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    login_methods_name = database.select({
        'select': ['method_name', 'enabled'],
        'table': ['login_methods'],
    })
    return login_methods_name, error


def disable_login_method(method_name):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    login_method_data = database.update({
        'table': ['login_methods'],
        'set': {
            'enabled': False,
        },
        'where': ['method_name = %s'],
        'data': [method_name]
    })
    if login_method_data[0] is False:
        error = gettext('DISABLE_LOGIN_METHOD_DATA_ERROR')
    return login_method_data, error


def enable_login_method(method_name):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    login_method_data = database.update({
        'table': ['login_methods'],
        'set': {
            'enabled': True,
        },
        'where': ['method_name = %s'],
        'data': [method_name]
    })
    if login_method_data[0] is False:
        error = gettext('ENABLE_LOGIN_METHOD_DATA_ERROR')
    return login_method_data, error

def check_user_ldap_connection(type_AD, domain_ldap, port_ldap, user_DN, user_password):
    if not user_DN and not user_password:
        return False
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_AD == 'openLDAP':
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
        elif type_AD == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
        with ldap3.Connection(server, authentication="SIMPLE", user=user_DN, password=user_password, auto_bind=True) as connection:
            if connection.bind() and connection.result["description"] == 'success':
                return True
            else :
                return False

    except LDAPException:
        return False


def check_user_connection(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix, username_attribute, username, password):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_AD == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_DN}'
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_DN, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_AD, domain_ldap, port_ldap, user_dn, password)
                        if not connection_status :
                            return False
                        else:
                            return True
        elif type_AD == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
            if prefix or suffix :
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_DN, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_AD, domain_ldap, port_ldap, user_dn, password)
                        if not connection_status:
                            return False
                        else:
                            return True

    except LDAPException :
        return False


def connection_ldap(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix):
    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_AD == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_DN}'
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
        elif type_AD == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
            if suffix or prefix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}

    except LDAPException :
        return {'status_server_ldap': False, 'connection_object': None}


def verify_ldap_server_connection(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix):
    error = None
    ldap_connection_status = False
    if type_AD and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_DN:
        ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
        try:
            if type_AD == 'openLDAP':
                username_admin = f'cn={username_ldap_admin},{base_DN}'
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

            elif type_AD == 'adLDAP':
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


def get_ldap_users(connection, classUser, objectClass, users_DN, base_DN):
    try:
        if not users_DN:
            status = connection.search(search_base=base_DN, search_filter=f'({classUser}={objectClass})',
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        else:
            status = connection.search(search_base=users_DN, search_filter=f'({classUser}={objectClass})',
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


def check_database_users(ldap_users_data, default_role):

    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    oc_users = []
    create_users = 0
    update_users = 0
    disabled_users = 0

    users_list = database.select({
        'select': ['*'],
        'table' :['users'],
        'where': ['status <> %s'],
        'data': ['DEL']
    })

    if users_list:
        for user in users_list:
            oc_users.append([user['username'], user['firstname'], user['lastname'], user['id']])
    for ldap_user in ldap_users_data:
        for oc_user in oc_users:
            if ldap_user[0] == oc_user[0]:
                if ldap_user[1] == oc_user[1] and ldap_user[2] == oc_user[2]:
                    user_status = database.select({
                        'select': ['enabled'],
                        'table': ['users'],
                        'where': ['username = %s'],
                        'data': [oc_user[0]]
                    })[0]['enabled']
                    if not user_status:
                        database.update({
                            'table': ['users'],
                            'set': {'enabled': True},
                            'where': ['username = %s'],
                            'data': [oc_user[0]]
                        })
                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
                    ldap_user[0] = 'Same'
                    oc_user[0] = 'Same'
                elif ldap_user[0] != 'Same' and oc_user[0] != 'Same':
                    if (ldap_user[1] != oc_user[1] and ldap_user[2] != oc_user[2]) or (ldap_user[1] != oc_user[1] and ldap_user[2] == oc_user[2]) or (ldap_user[1] == oc_user[1] and ldap_user[2] != oc_user[2]):
                        database.update({
                            'table': ['users'],
                            'set': {
                                'firstname': str(ldap_user[1]),
                                'lastname': str(ldap_user[2]),
                                'role': default_role,
                                'enabled': True,
                            },
                            'where': ['username = %s'],
                            'data': [oc_user[0]]
                        })

                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
            else:
                continue
    for oc_user in oc_users:
        if oc_user[0] != 'Same' and oc_user[0] != 'Updated':
            user_oc_status = database.select({
                'select': ['enabled'],
                'table': ['users'],
                'where': ['username = %s'],
                'data': [oc_user[0]]
            })[0]['enabled']
            if user_oc_status != '' and user_oc_status:
                is_user_superadmin = get_user_role_by_username(oc_user[0])
                if is_user_superadmin[0] != 'superadmin':
                    database.update({
                        'table': ['users'],
                        'set': {
                            'enabled': False,
                        },
                        'where': ['username = %s','role <> %s'],
                        'data': [oc_user[0], 1]
                    })
                    disabled_users += 1
                else:
                    continue

    for user_to_create in ldap_users_data:
        if user_to_create[0] != 'Same' and user_to_create[0] != 'Updated':
            random_password = str(uuid.uuid4())
            hash_password = generate_password_hash(random_password)
            database.insert({
                'table': 'users',
                'columns': {
                    'username': user_to_create[0],
                    'firstname': user_to_create[1],
                    'lastname': user_to_create[2],
                    'password': hash_password,
                    'role': default_role
                }
            })

            user_to_create[0] = 'Created'
            create_users += 1

    return {'create_users': create_users, 'disabled_users': disabled_users, 'update_users': update_users}


def synchronization_ldap_users(ldap_synchronization_data):
    error = None
    result_synchro = None
    if ldap_synchronization_data :
        attributSourceUser = ldap_synchronization_data['attributSourceUser']
        classObject = ldap_synchronization_data['classObject']
        classUser = ldap_synchronization_data['classUser']
        attributFirstName = ldap_synchronization_data['attributFirstName']
        attributLastName = ldap_synchronization_data['attributLastName']
        attributRoleDefault = ldap_synchronization_data['attributRoleDefault']
        users_DN = ldap_synchronization_data['usersDN'] if 'usersDN' in ldap_synchronization_data else ''

        type_AD = ldap_synchronization_data['typeAD']
        domain_ldap = ldap_synchronization_data['host']
        port_ldap = ldap_synchronization_data['port']
        username_ldap_admin = ldap_synchronization_data['loginAdmin']
        password_ldap_admin = ldap_synchronization_data['passwordAdmin']
        base_DN = ldap_synchronization_data['baseDN']
        suffix = ldap_synchronization_data['suffix'] if 'suffix' in ldap_synchronization_data else ''
        prefix = ldap_synchronization_data['prefix'] if 'prefix' in ldap_synchronization_data else ''
        if type_AD and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_DN:
            ldap_connection = connection_ldap(type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_DN, suffix, prefix)
            if attributSourceUser and classUser and classObject and attributFirstName and attributLastName and attributRoleDefault:
                if ldap_connection['status_server_ldap']:
                    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], classUser, classObject, users_DN,
                                                     base_DN)
                    if list_ldap_users and list_ldap_users['status_search'] == True:
                        ldap_users_data = get_ldap_users_data(list_ldap_users, attributSourceUser, attributFirstName,
                                                              attributLastName)
                        if ldap_users_data and ldap_users_data['status_search']:
                            result_synchro = check_database_users(ldap_users_data['ldap_users_data'], attributRoleDefault)

                        else:
                            error_message = gettext('LDAP_SYNCRO_INFOS_ERROR')
                            error = {
                                "errors": gettext('LDAP_SYNCRO_ERROR'),
                                "message": error_message
                            }

                    else:
                        error_message = gettext('LDAP_SYNCRO_INFOS_ERROR')
                        error = {
                            "errors": gettext('LDAP_SYNCRO_ERROR'),
                            "message": error_message
                        }

                else:
                    error_message = gettext('LDAP_CONNECTION_ERROR')
                    error = {
                        "errors": gettext('LDAP_SYNCRO_ERROR'),
                        "message": error_message
                    }
            else:
                error_message = gettext('INFOS_LDAP_NOT_COMPLETE')
                error = {
                    "errors": gettext('LDAP_SYNCRO_ERROR'),
                    "message": error_message
                }

        else:
            error_message = gettext('INFOS_LDAP_NOT_COMPLETE')
            error = {
                "errors": gettext('LDAP_SYNCRO_ERROR'),
                "message": error_message
            }
    return result_synchro , error
