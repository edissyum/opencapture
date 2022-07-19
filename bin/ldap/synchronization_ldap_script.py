#!/usr/bin/env python3
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

# @dev: Essaid MEGHELLET <essaid.meghellet@edissyum.com>

import os
import sys
import uuid
import ldap3
import psycopg2
import configparser
from datetime import datetime
from ldap3 import Server, ALL
from ldap3.core.exceptions import LDAPException
from werkzeug.security import generate_password_hash

sys.path.insert(0, '/var/www/html/opencaptureforinvoices/')
from src.backend.main import create_classes_from_custom_id


def print_log(message):
    """
   :param message:
   :return:
    """
    now = datetime.now()
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    file = open(LOG_FILEPATH, "a+")
    message_toprint = "[ " + dt_string + " ]: " + message + " \n"
    file.write(message_toprint)


def retrieve_ldap_synchronization_data():
    try:
        # Informations Ldap config
        global type_AD, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, prefix, suffix
        # Informations Ldap synchronization users
        global user_id, firstname, lastname, class_user, object_class, default_password, default_role, users_dn

        _vars = create_classes_from_custom_id(CUSTOM_ID)
        database = _vars[0]
        database_res = database.select({
            'select': ['data'],
            'table': ['login_methods'],
            'where': ['method_name = %s'],
            'data': ['ldap']
        })[0]['data']

        if not database_res:
            print_log("ALERT !! ==> Script stops because the sync information does not exist correctly in the database")
            sys.exit(0)
        if not database_res:
            print_log("Error during the execution of the request")
            sys.exit(0)

        type_AD = database_res['typeAD']
        domain_ldap = database_res['host']
        port_ldap = database_res['port']
        username_ldap_admin = database_res['loginAdmin']
        password_ldap_admin = database_res['passwordAdmin']
        base_dn = database_res['baseDN']
        prefix = database_res['prefix'] if 'prefix' in database_res else ''
        suffix = database_res['suffix'] if 'suffix' in database_res else ''
        user_id = database_res['attributSourceUser']
        users_dn = database_res['usersDN'] if 'usersDN' in database_res else ''
        firstname = database_res['attributFirstName']
        lastname = database_res['attributLastName']
        class_user = database_res['classUser']
        object_class = database_res['classObject']
        default_role = database_res['attributRoleDefault']
        if not type_AD and not domain_ldap or not port_ldap or not username_ldap_admin or not password_ldap_admin or not base_dn:
            print_log("Information is missing to connect to the ldap server")
            sys.exit(0)
        if not user_id or not firstname or not lastname or not class_user or not object_class or not default_role:
            print_log("Information is missing to synchronise users")
            sys.exit(0)
    except (Exception, psycopg2.Error) as error:
        print_log("Error:" + str(error) + "]")


def check_connection_ldap_server():
    ldap_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    username_admin_adldap = f'cn={username_ldap_admin},{base_dn}'
    username_admin_openldap = f'{username_ldap_admin}'
    try:
        if type_AD == 'openLDAP':
            server = Server(ldap_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin_adldap, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    print_log('Connection to the ldap server status: '+str(connection.result["description"]))
                    return {'status_server_ldap': True, 'connection_object': connection}
                else:
                    print_log('Connection to the ldap server status: ' + str(
                        connection.result["description"]))
                    return {'status_server_ldap': True, 'connection_object': None}
        elif type_AD == 'adLDAP':
            server = Server(ldap_server, get_info=ALL)
            if prefix or suffix:
                username_admin_openldap = f'{prefix}{username_admin_openldap}{suffix}'
            with ldap3.Connection(server, user=username_admin_openldap, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
    except LDAPException as err:
        print_log('Unable to connect to LDAP server: ' + str(err))
        return {'status_server_ldap': False, 'connection_object': None}


def get_ldap_users(connection, class_user, object_class, users_dn):
    """
   :param connection:
   :param username:
   :param passwordAttribute:
   :return:
    """
    try:
        if not connection:
            print_log('The connection to the ldap server failed')
            sys.exit(0)
        if not users_dn:
            status = connection.search(search_base=base_dn, search_filter=f'({class_user}={object_class})',
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        else:
            status = connection.search(search_base=users_dn, search_filter=f'({class_user}={object_class})',
                                       search_scope='SUBTREE', attributes=['*'])

        if connection and status:
            print_log("The number of users found on LDAP: " + str(len(connection.entries)))
            return {'status_search': True, 'ldap_users': connection.entries}
        else:
            print_log("No user is found on the ldap server ")
            return {'status_search': False, 'ldap_users': ""}
    except LDAPException:
        print_log('Search doesn t work')
        return False


def get_ldap_users_data(ldap_users_dict):
    if ldap_users_dict and ldap_users_dict['status_search']:
        list_users_ldap = ldap_users_dict['ldap_users']
        ldap_users_data = []
        for i in range(len(list_users_ldap)):
            user_data = []
            user_data.append(list_users_ldap[i][user_id][0])
            user_data.append(list_users_ldap[i][firstname][0])
            user_data.append(list_users_ldap[i][lastname][0])
            ldap_users_data.append(user_data)
        print_log("List of users retrieved from the ldap server " + str(ldap_users_data))
        return ldap_users_data


def check_database_users(ldap_users_data, default_role):
    """
   :param ldap_users_data:
   :param default_role:
   :return:
    """
    _vars = create_classes_from_custom_id(CUSTOM_ID)
    database = _vars[0]
    try:
        users = database.select({
            'select': ['*'],
            'table': ['users'],
        })
        oc_users = []
        create_users = 0
        update_users = 0
        disabled_users = 0
        if users:
            for user in users:
                oc_users.append([user['username'], user['firstname'], user['lastname']])
        print_log("Users retrieved from the OCFORINVOICES database " + str(oc_users))
        print_log("Users retrieved from the  LDAP " + str(ldap_users_data))
        print_log("Start of synchronization program")
        for ldap_user in ldap_users_data:
            for oc_user in oc_users:
                if ldap_user[0] == oc_user[0]:
                    if ldap_user[1] == oc_user[1] and ldap_user[2] == oc_user[2]:
                        print_log('User ' + str(ldap_user[0]) + ' exists in LDAP with the same data')
                        user_status = database.select({
                            'select': ['enabled'],
                            'table': ['users'],
                            'where': ['username = %s'],
                            'data': [oc_user[0]]
                        })
                        if not user_status[0]:
                            database.update({
                                'table': ['users'],
                                'set': {
                                    'enabled': True
                                },
                                'where': ['username = %s'],
                                'data': [oc_user[0]]
                            })
                            ldap_user[0] = 'Updated'
                            oc_user[0] = 'Updated'
                            update_users += 1
                        ldap_user[0] = 'Same'
                        oc_user[0] = 'Same'
                    elif ldap_user[0] != 'Same' and oc_user[0] != 'Same':
                        if (ldap_user[1] != oc_user[1] and ldap_user[2] != oc_user[2]) or (ldap_user[1] != oc_user[1]
                               and ldap_user[2] == oc_user[2]) or (ldap_user[1] == oc_user[1]
                               and ldap_user[2] != oc_user[2]):
                            database.update({
                                'table': ['users'],
                                'set': {
                                    'firstname': ldap_user[1],
                                    'lastname': ldap_user[2],
                                    'role': default_role
                                },
                                'where': ['username = %s'],
                                'data': [oc_user[0]]
                            })
                            ldap_user[0] = 'Updated'
                            oc_user[0] = 'Updated'
                            update_users += 1
                            print_log('update data for the user  '+ str(ldap_user[1]))
                else:
                    continue

        for oc_user in oc_users:
            if oc_user[0] != 'Same' and oc_user[0] != 'Updated':
                user_oc_status = database.select({
                    'select': ['enabled'],
                    'table': ['users'],
                    'where': ['username = %s'],
                    'data': [oc_user[0]]
                })
                if user_oc_status and user_oc_status[0]:
                    user_role = database.select({
                        'select': ['label_short'],
                        'table': ['users', 'roles'],
                        'left_join': ['users.role = roles.id'],
                        'where': ['username = %s'],
                        'data': [oc_user[0]]
                    })

                    if user_role[0] == 'superadmin':
                        continue

                    database.update({
                        'table': ['users'],
                        'set': {
                            'enabled': False
                        },
                        'where': ['username = %s'],
                        'data': [oc_user[0]]
                    })
                    disabled_users += 1
                    print_log("user status is disabled :" + str(oc_user[0]))
                else:
                    pass
        for user_to_create in ldap_users_data:
            if user_to_create[0] != 'Same' and user_to_create[0] != 'Updated':
                random_password = str(uuid.uuid4())
                hash_password = generate_password_hash(random_password)
                new_user = database.insert({
                    'table': 'users',
                    'columns': {
                        'username': user_to_create[0],
                        'firstname': user_to_create[1],
                        'lastname': user_to_create[2],
                        'password': hash_password,
                        'role': default_role
                    }
                })

                if new_user:
                    print_log("User " + str(user_to_create[0]) + " successfully inserted in the users table")
                else:
                    print_log("Error when inserting the user in the database:" + str(user_to_create[0]))
                user_to_create[0] = 'Created'
                create_users += 1
        return{'create_users': create_users, 'disabled_users': disabled_users, 'update_users': update_users}
    except (psycopg2.OperationalError, psycopg2.ProgrammingError) as err:
        return str(err).split('\n', maxsplit=1)[0]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_log('Arguments are missing to run the script')
        sys.exit(0)

    thisfolder = os.path.dirname(os.path.abspath(__file__))
    config_file = os.path.join(thisfolder, sys.argv[1])
    config = configparser.RawConfigParser()
    res = config.read(config_file)

    # Recuperer les deux chemins vers le fichier de config_default.ini  et le fichier de log
    CONFIG_FILEPATH = config.get("file_path", 'config_file')
    LOG_FILEPATH = config.get("file_path", 'log_file')
    CUSTOM_ID = config.get('file_path', 'custom_id')

    if not CONFIG_FILEPATH or not LOG_FILEPATH:
        print_log('Path to config file and/or log file does not exist in the config file')
        sys.exit(0)
    else:
        if not os.path.isfile(LOG_FILEPATH):
            print_log('The path to the log file does not exist in the config file')
            sys.exit(0)
        if not os.path.isfile(CONFIG_FILEPATH):
            print_log('The path to the config file does not exist in the config file')
            sys.exit(0)

    retrieve_ldap_synchronization_data()
    ldap_connection = check_connection_ldap_server()
    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], class_user, object_class, users_dn)
    ldap_users_data = get_ldap_users_data(list_ldap_users)
    result = check_database_users(ldap_users_data, default_role)
    print_log('Result of synchronization operation: ' + str(result))
