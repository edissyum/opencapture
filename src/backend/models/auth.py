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
from flask import request
from flask_babel import gettext
from werkzeug.security import check_password_hash
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


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
