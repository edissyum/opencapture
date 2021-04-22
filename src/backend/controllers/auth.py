import jwt
import datetime
import functools
import jwt.exceptions
from flask_babel import gettext
from flask import request, session, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import auth as auth_model


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
    user, error = auth_model.login({
        'username': username,
        'password': password
    })

    if error is None:
        session.clear()
        encoded_token = encode_auth_token(user['id'])
        session['lang'] = lang

        response = {
            'auth_token': encoded_token[0].decode(),
            'days_before_exp': encoded_token[1],
            'user':  auth_model.get_user_by_id({
                'select': ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'creation_date', 'enabled'],
                'user_id': user['id']
            })[0]
        }

        return response, 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": error
        }
        return response, 401


def register(username, password, firstname, lastname, lang):
    if request.method == 'POST':
        session['lang'] = lang
        user, error = auth_model.registrer({
            'username': username,
            'password': password,
            'firstname': firstname,
            'lastname': lastname
        })

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('REGISTER_ERROR'),
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

            user, error = auth_model.get_user_by_id({
                'select': ['id'],
                'user_id': token['sub']
            })

            if not user:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": "User doesn't exist"}), 500
        else:
            return jsonify({"errors": gettext("JWT_ERROR"), "message": "Valid token is mandatory"}), 500
        return view(**kwargs)
    return wrapped_view
