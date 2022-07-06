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
from flask_babel import gettext
from src.backend.main import create_classes_from_current_config
from werkzeug.security import check_password_hash


def login(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    user = _db.select({
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    user_role_id = _db.select({
        'select': ['role'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [username]
    })
    if not user_role_id:
        error = gettext('ROLE_DOESNT_EXISTS')
        return user_role_id, error
    else:
        user_role_label = _db.select({
            'select': ['label_short'],
            'table': ['roles'],
            'where': ['id = %s'],
            'data': [user_role_id[0]['role']]
        })
        if not user_role_label:
            error = gettext('ROLE_DOESNT_EXISTS')

        return user_role_label[0]['label_short'], error


def verify_user_by_username(username):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    user_id = _db.select({
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    enabled_method_name = _db.select({
        'select': ['method_name'],
        'table': ['login_methods'],
        'where': ['enabled = true'],
    })

    return enabled_method_name, error


def get_ldap_configurations():
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    ldap_configurations = _db.select({
        'select': ['data'],
        'table': ['login_methods'],
        'where': ['method_name = %s'],
        'data': ['ldap']
    })
    if not ldap_configurations or not ldap_configurations[0]['data']:
        error = gettext('NO_LDAP_CONFIGURATIONS_FOUND')

    return ldap_configurations, error


def update_login_method(login_method_name, server_data):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    login_method_data = _db.update({
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
        _db.update({
            'table': ['login_methods'],
            'set': {
                'enabled': False,
            },
            'where': ['method_name <> %s'],
            'data': [login_method_name]
        })
    return login_method_data, error


def retrieve_login_methods():
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    login_methods_name = _db.select({
        'select': ['method_name', 'enabled'],
        'table': ['login_methods'],
    })
    return login_methods_name, error


def disable_login_method(method_name):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    login_method_data = _db.update({
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    login_method_data = _db.update({
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
