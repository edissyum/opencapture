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

# @dev : Essaid MEGHELLET <essaid.meghellet@edissyum.com>

import ldap3
import sys
from ldap3.core.exceptions import LDAPException
from ldap3 import Server, ALL


def check_connection_ldap_server(username_ldap_admin, domain_ldap, port_ldap, password_ldap_admin, base_dn, type_ad,
                                 prefix, suffix):
    """
    Check the connection to the ldap server

    :param username_ldap_admin:
    :param domain_ldap:
    :param port_ldap:
    :param password_ldap_admin:
    :param type_ad:
    :param prefix:
    :param suffix:
    :return:
    """

    ldsp_server = f"" + domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldsp_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    print('Connection to the ldap server status: ' + str(
                        connection.result["description"]))  # "success" if bind is ok
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    print('Connection to the ldap server status: ' + str(
                        connection.result["description"]))  # "success" if bind is ok
                    return {'status_server_ldap': True, 'connection_object': connection}
        elif type_ad == 'adLDAP':
            server = Server(ldsp_server, get_info=ALL)
            if prefix or suffix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'

            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True) \
                    as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
    except LDAPException as err:
        print('Unable to connect to LDAP server : ' + str(err))
        return {'status_server_ldap': False, 'connection_object': None}


def get_ldap_users(connection, base_dn, users_dn):
    """
    :param connection:
    :param users_dn:
    :param classUser:
    :param objectClass:
    :return:
    """
    try:
        if not connection:
            print('The connection to the ldap server failed')
            sys.exit(0)

        if not users_dn:
            status = connection.search(search_base=base_dn, search_scope='SUBTREE', attributes=['*'])
        else:
            status = connection.search(search_base=users_dn, search_filter=f'(cn=*)', search_scope='SUBTREE',
                                       attributes=['*'])
        if connection and status:
            print("The number of users found on LDAP : " + str(len(connection.entries)))
            return {'status_search': True, 'ldap_users': connection.entries}
        else:
            print("No user is found on the ldap server ")
            return {'status_search': False, 'ldap_users': ""}
    except LDAPException:
        print('Search doesn t work')
        return False


if __name__ == "__main__":
    type_ad = ''
    domain_ldap = ''
    port_ldap = ''
    username_ldap_admin = ''
    password_ldap_admin = ''
    prefix = ''
    suffix = ''
    base_dn = ''
    users_dn = ''
    ldap_connection = check_connection_ldap_server(username_ldap_admin, domain_ldap, port_ldap, password_ldap_admin,
                                                   base_dn, type_ad, prefix, suffix)
    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], base_dn, users_dn)
    print(list_ldap_users)
