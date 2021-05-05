import jwt
import datetime
import functools
from flask_babel import gettext
from flask import request, session, jsonify, current_app

from . import privileges
from ..models import auth, user, roles


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
    except Exception as e:
        return e


def login(username, password, lang):
    session['lang'] = lang
    user_info, error = auth.login({
        'username': username,
        'password': password
    })

    if error is None:
        session.clear()
        encoded_token = encode_auth_token(user_info['id'])
        session['lang'] = lang

        returned_user = user.get_user_by_id({
            'select': ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'creation_date', 'enabled'],
            'user_id': user_info['id']
        })[0]

        user_privileges = privileges.get_user_privileges(user_info['role'])
        if user_privileges:
            returned_user['privileges'] = user_privileges[0]

        user_role = roles.get_role_by_id({'role_id': user_info['role']})
        if user_role:
            returned_user['role'] = user_role[0]

        response = {
            'auth_token': encoded_token[0].decode(),
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
                token = jwt.decode(token, current_app.config['SECRET_KEY'])
            except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
                    jwt.ExpiredSignatureError) as e:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": str(e)}), 500

            user_info, error = user.get_user_by_id({
                'select': ['id'],
                'user_id': token['sub']
            })

            if not user_info:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": "User doesn't exist"}), 500
        else:
            return jsonify({"errors": gettext("JWT_ERROR"), "message": "Valid token is mandatory"}), 500
        return view(**kwargs)
    return wrapped_view
