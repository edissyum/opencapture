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

import json
import datetime
from flask_babel import gettext
from flask import request, session
from src.backend.import_controllers import auth
from src.backend.import_models import user, accounts
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from werkzeug.security import check_password_hash, generate_password_hash


def create_user(args):
    res, error = user.create_user(args)

    if error is None:
        if 'configurations' in session:
            configurations = json.loads(session['configurations'])
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            configurations = _vars[10]

        if configurations['userQuota']['enabled'] is True:
            quota = configurations['userQuota']['quota']
            user_filtered = configurations['userQuota']['users_filtered']
            email_dest = configurations['userQuota']['email_dest']
            active_users, _ = user.get_users({
                'select': ['id', 'username', 'count(*) OVER() as total'],
                'where': ['status NOT IN (%s)', "role <> 1"],
                'data': ['DEL']
            })
            total_active_users = active_users[0]['total']
            for _user in active_users:
                if _user['username'] in user_filtered:
                    total_active_users -= 1

            if quota <= total_active_users:
                custom_id = retrieve_custom_from_url(request)
                _vars = create_classes_from_custom_id(custom_id, True)
                smtp = _vars[8]
                if email_dest and smtp.is_up:
                    smtp.send_user_quota_notifications(email_dest, custom_id)
        return {'id': res}, 200
    else:
        response = {
            "errors": gettext('CREATE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_users(args):
    users, _ = user.get_users(args)

    response = {
        "users": users
    }
    return response, 200


def get_users_full(args):
    users, _ = user.get_users_full(args)

    response = {
        "users": users
    }
    return response, 200


def get_user_by_id(user_id, get_password=False):
    _select = ['users.id', 'username', 'firstname', 'email', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled']
    if get_password:
        _select.append('password')

    user_info, error = user.get_user_by_id({
        'select': _select,
        'user_id': user_id
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_user_by_mail(user_mail):
    user_info, error = user.get_user_by_mail({
        'select': ['users.id', 'username', 'firstname', 'email', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled'],
        'user_mail': user_mail
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_user_by_username(username):
    _select = ['users.id', 'username', 'firstname', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled']
    user_info, error = user.get_user_by_username({
        'select': _select,
        'username': username
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_USERNAME_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def send_email_forgot_password(args):
    user_info, error = user.get_user_by_id({'user_id': args['userId']})
    if error is None:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id, True)
        smtp = _vars[8]
        if smtp.is_up:
            reset_token = auth.generate_reset_token(args['userId'])
            user.update_user({'set': {'reset_token': reset_token}, 'user_id': args['userId']})
            smtp.send_forgot_password_email(user_info['email'], args['currentUrl'], reset_token)
        return user_info, 200
    else:
        response = {
            "errors": gettext('SEND_EMAIL_FORGOT_PASSWORD_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def reset_password(args):
    decoded_token, status = auth.decode_reset_token(args['resetToken'])
    if status == 500:
        return decoded_token, status

    user_info, error = user.get_user_by_id({'user_id': decoded_token['sub']})
    if error is None:
        if user_info['reset_token'] == args['resetToken']:
            user.update_user({'set': {'reset_token': '', 'password': generate_password_hash(args['newPassword'])}, 'user_id': decoded_token['sub']})
            del user_info['password']
            del user_info['reset_token']
            return user_info, 200
        response = {
            "errors": gettext('RESET_PASSWORD_ERROR'),
            "message": gettext('RESET_TOKEN_MISMATCH')
        }
        return response, 401
    response = {
        "errors": gettext('RESET_PASSWORD_ERROR'),
        "message": gettext('GET_USER_BY_ID_ERROR')
    }
    return response, 401

def get_customers_by_user_id(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        if user_info['label_short'] == 'superadmin':
            customers = accounts.retrieve_customers({
                'select': ['id'],
                'where': ['status <> %s'],
                'data': ['DEL'],
            })
        else:
            customers, error = user.get_customers_by_user_id({'user_id': user_id})

        if error is None:
            if user_info['label_short'] == 'superadmin':
                _customers = []
                for _c in customers:
                    _customers.append(_c['id'])
                customers = _customers
            else:
                if type(eval(customers['customers_id']['data'])) == list:
                    customers = eval(customers['customers_id']['data'])
        return customers, 200
    else:
        response = {
            "errors": gettext('GET_CUSTOMER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def update_user(user_id, data):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    configurations = _vars[10]
    minutes_before_exp = configurations['jwtExpiration']
    user_info, error = user.get_user_by_id({'user_id': user_id})

    if error is None:
        if 'new_password' in data and 'old_password' in data and data['new_password'] and data['old_password'] and not check_password_hash(user_info['password'], data['old_password']):
            response = {
                "errors": gettext('UPDATE_PROFILE'),
                "message": gettext('ERROR_OLD_PASSWORD_NOT_MATCH')
            }
            return response, 401
        elif 'password' in data and 'password_check' in data and data['password'] and data['password_check'] and data['password'] != data['password_check']:
            response = {
                "errors": gettext('UPDATE_USER'),
                "message": gettext('ERROR_PASSWORD_NOT_MATCH')
            }
            return response, 401

        _set = {
            'firstname': data['firstname'],
            'lastname': data['lastname'],
            'email': data['email'],
            'role': data['role']
        }

        if 'new_password' in data and data['new_password']:
            _set.update({
                'password': generate_password_hash(data['new_password'])
            })
        elif 'password' in data and data['password']:
            _set.update({
                'password': generate_password_hash(data['password'])
            })

        _, error = user.update_user({'set': _set, 'user_id': user_id})

        if error is None:
            user_info = user.get_user_by_id({'user_id': user_id})
            return {"user": user_info[0], "minutes_before_exp": minutes_before_exp}, 200
        else:
            response = {
                "errors": gettext('UPDATE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def delete_user(user_id):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'status': 'DEL'}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def disable_user(user_id):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'enabled': False}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def enable_user(user_id):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'enabled': True}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('ENABLE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def update_customers_by_user_id(user_id, customers):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _set = {
            'customers_id': '{"data": "' + str(customers) + '"}',
        }
        _, error = user.update_customers_by_user_id({'set': _set, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_CUSTOMERS_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_CUSTOMERS_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 401
