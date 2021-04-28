# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import flash, g, redirect, render_template, request, url_for

from flask_babel import gettext
from werkzeug.security import check_password_hash, generate_password_hash
from import_controllers import pdf
from ..models import user


def retrieve_users(args):
    _vars = pdf.init()
    _config = _vars[1]

    users, error = user.retrieve_users(args)
    if users:
        response = {
            "users": users
        }
        return response, 200
    else:
        response = {
            "errors": gettext("USERS_ERROR"),
            "message": error
        }
        return response, 401


def retrieve_user_by_id(user_id, get_password=False):
    _select = ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'creation_date', 'enabled']
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
            "errors": gettext('USER_ERROR'),
            "message": error
        }
        return response, 401


def update_user(user_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    user_info, error = user.get_user_by_id({'user_id': user_id})

    if error is None:
        if data['new_password'] and data['old_password'] and not check_password_hash(user_info[0]['password'], data['old_password']):
            response = {
                "errors": gettext('UPDATE_PROFILE'),
                "message": gettext('ERROR_OLD_PASSWORD_NOT_MATCH')
            }
            return response, 401

        _set = {
            'firstname': data['firstname'],
            'lastname': data['lastname'],
            'role': data['role']
        }

        if data['new_password']:
            _set.update({
                'password': generate_password_hash(data['new_password'])
            })

        res, error = user.update_user({'set': _set, 'user_id': user_id})

        if error is None:
            days_before_exp = 1
            user_info = user.get_user_by_id({'user_id': user_id})
            return {"user": user_info[0], "days_before_exp": days_before_exp}, 200
        else:
            response = {
                "errors": gettext('UPDATE_USER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_USER_ERROR'),
            "message": error
        }
        return response, 401


def delete_user(user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        res, error = user.update_user({'set': {'status': 'DEL'}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_USER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_USER_ERROR'),
            "message": error
        }
        return response, 401


def disable_user(user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        res, error = user.update_user({'set': {'enabled': False}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_USER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_USER_ERROR'),
            "message": error
        }
        return response, 401


def enable_user(user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        res, error = user.update_user({'set': {'enabled': True}, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_USER_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_USER_ERROR'),
            "message": error
        }
        return response, 401


def change_role(role, user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = check_user(user_id)
    if user is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'role': role
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('UPDATE_ROLE_OK'))
        else:
            flash(gettext('UPDATE_ROLE_ERROR') + ' : ' + str(res[1]))


def change_password(old_password, new_password, user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = check_user(user_id)
    if user is not False:
        if not check_password_hash(user['password'], old_password):
            flash(gettext('ERROR_OLD_PASSWORD_NOT_MATCH'))
        else:
            res = _db.update({
                'table': ['users'],
                'set': {
                    'password': generate_password_hash(new_password)
                },
                'where': ['id = ?'],
                'data': [user_id]
            })

            if res[0] is not False:
                flash(gettext('UPDATE_OK'))
            else:
                flash(gettext('UPDATE_ERROR') + ' : ' + str(res[1]))
    else:
        flash(gettext('ERROR_WHILE_RETRIEVING_USER'))
