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

import jwt
import datetime
import functools
from . import privileges
from flask_babel import gettext
from src.backend.import_models import auth, user, roles
from flask import request, session, jsonify, current_app


def encode_auth_token(user_id):
    """
    Generates the Auth Token
    :return: string
    """
    days_before_exp = 1
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=days_before_exp, seconds=0),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            current_app.config.get('SECRET_KEY'),
            algorithm='HS512'
        ), days_before_exp
    except Exception as _e:
        return str(_e)


def logout():
    for key in list(session.keys()):
        session.pop(key)


def login(username, password, lang, method='default'):
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
        encoded_token = encode_auth_token(user_info['username'])
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
            'days_before_exp': encoded_token[1],
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
    session['lang'] = lang
    error = None

    try:
        decoded_token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        return jsonify({"errors": gettext("JWT_ERROR"), "message": str(_e)}), 500

    if error is None:
        encoded_token = token
        returned_user = user.get_user_by_username({
            'select': ['users.id', 'username', 'firstname', 'lsastname', 'role', 'users.status', 'creation_date', 'users.enabled'],
            'username': decoded_token['sub']
        })[0]

        user_privileges = privileges.get_privileges_by_role_id({'role_id': returned_user['role']})
        if user_privileges:
            returned_user['privileges'] = user_privileges[0]

        user_role = roles.get_role_by_id({'role_id': returned_user['role']})
        if user_role:
            returned_user['role'] = user_role[0]

        response = {
            'auth_token': str(encoded_token),
            'days_before_exp': 1,
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
                token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
            except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
                    jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": str(_e)}), 500

            user_info, _ = user.get_user_by_username({
                'select': ['users.id'],
                'username': token['sub']
            })

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
    login_methods_data, error = auth.retrieve_login_methods()
    if error is None:
        response = {
            "login_methods_data": login_methods_data
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
