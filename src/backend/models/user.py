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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask import request, g as current_context
from gettext import gettext
from werkzeug.security import generate_password_hash
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def create_user(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    user = database.select({
        'select': ['id'],
        'table': ['users'],
        'where': ['username = %s'],
        'data': [args['username']]
    })

    if not args['username']:
        error = gettext('BAD_USERNAME')
    elif not args['password']:
        error = gettext('BAD_PASSWORD')
    elif user:
        error = gettext('USER') + ' ' + args['username'] + ' ' + gettext('ALREADY_REGISTERED')

    if error is None:
        user_id = database.insert({
            'table': 'users',
            'columns': {
                'username': args['username'],
                'firstname': args['firstname'],
                'lastname': args['lastname'],
                'email': args['email'],
                'role': args['role'],
                'password': generate_password_hash(args['password']),
            }
        })
        database.insert({
            'table': 'users_customers',
            'columns': {
                'user_id': user_id,
                'customers_id': json.dumps({"data": str(args['customers'])})
            }
        })
        database.insert({
            'table': 'users_forms',
            'columns': {
                'user_id': user_id,
                'customers_id': json.dumps({"data": str(args['forms'])})
            }
        })
        return user_id, error
    else:
        return False, error


def get_users(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    users = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['status NOT IN (%s)', "role <> 1"] if 'where' not in args else args['where'],
        'data': ['DEL'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })

    return users, error


def get_users_full(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    users = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['status NOT IN (%s)'],
        'data': ['DEL'],
        'order_by': ['id ASC'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })

    return users, error


def get_user_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    user = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users', 'roles'],
        'left_join': ['users.role = roles.id'],
        'where': ['users.id = %s'],
        'data': [args['user_id']]
    })

    if not user:
        error = gettext('GET_USER_BY_ID_ERROR')
    else:
        user = user[0]

    return user, error


def get_user_by_mail(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    user = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['users.email = %s'],
        'data': [args['user_mail']]
    })

    if not user:
        error = gettext('GET_USER_BY_MAIL_ERROR')
    else:
        user = user[0]

    return user, error


def get_user_by_username(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    user = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users', 'roles'],
        'left_join': ['users.role = roles.id'],
        'where': ['users.username = %s'],
        'data': [args['username']]
    })

    if not user:
        error = gettext('GET_USER_BY_ID_ERROR')
    else:
        user = user[0]

    return user, error


def get_customers_by_user_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    customers = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users_customers'],
        'where': ['user_id = %s'],
        'data': [args['user_id']]
    })

    if not customers:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')
    else:
        customers = customers[0]
    return customers, error


def get_forms_by_user_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    customers = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users_forms'],
        'where': ['user_id = %s'],
        'data': [args['user_id']]
    })

    if not customers:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')
    else:
        customers = customers[0]
    return customers, error


def update_user(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    user = database.update({
        'table': ['users'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['user_id']]
    })

    if user[0] is False:
        error = gettext('UPDATE_USER_ERROR')

    return user, error


def update_customers_by_user_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    user = database.update({
        'table': ['users_customers'],
        'set': args['set'],
        'where': ['user_id = %s'],
        'data': [args['user_id']]
    })

    if user[0] is False:
        error = gettext('UPDATE_CUSTOMERS_USER_ERROR')

    return user, error


def update_forms_by_user_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    user = database.update({
        'table': ['users_forms'],
        'set': args['set'],
        'where': ['user_id = %s'],
        'data': [args['user_id']]
    })

    if user[0] is False:
        error = gettext('UPDATE_FORMS_USER_ERROR')

    return user, error


def update_user_ldap(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    user = database.update({
        'table': ['users'],
        'set': args['set'],
        'where': ['username = %s', 'role <> %s'],
        'data': [args['username'], args['role']]
    })

    if user[0] is False:
        error = gettext('UPDATE_USER_ERROR')

    return user, error
