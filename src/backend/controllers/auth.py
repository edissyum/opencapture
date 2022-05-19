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
from flask_babel import gettext
from flask import request, session, jsonify, current_app

from . import privileges
from src.backend.import_models import auth, user, roles


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
            algorithm='HS256'
        ), days_before_exp
    except Exception as _e:
        return str(_e)


def login(username, password, lang):
    session['lang'] = lang
    user_info, error = auth.login({
        'username': username,
        'password': password
    })

    if error is None:
        encoded_token = encode_auth_token(user_info['id'])

        returned_user = user.get_user_by_id({
            'select': ['users.id', 'username', 'firstname', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled'],
            'user_id': user_info['id']
        })[0]

        user_privileges = privileges.get_privileges_by_role_id({'role_id': user_info['role']})
        if user_privileges:
            returned_user['privileges'] = user_privileges[0]

        user_role = roles.get_role_by_id({'role_id': user_info['role']})
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


def token_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split('Bearer')[1].lstrip()
            try:
                token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms=["HS256"])
            except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
                    jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": str(_e)}), 500

            user_info, _ = user.get_user_by_id({
                'select': ['users.id'],
                'user_id': token['sub']
            })

            if not user_info:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": "User doesn't exist"}), 500
        else:
            return jsonify({"errors": gettext("JWT_ERROR"), "message": "Valid token is mandatory"}), 500
        return view(**kwargs)
    return wrapped_view
