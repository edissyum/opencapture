import functools
import datetime

import jwt, jwt.exceptions
from flask_babel import gettext
from werkzeug.security import check_password_hash, generate_password_hash
from flask import request, session, jsonify, current_app

from webApp.db import get_db


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
        db = get_db()
        session['lang'] = lang
        error = None
        user = db.select({
            'select': ['*'],
            'table': ['users'],
            'where': ['username = ?'],
            'data': [username]
        })

        if not user:
            error = gettext('USERNAME_REQUIRED')
        elif not check_password_hash(user[0]['password'], password):
            error = gettext('PASSWORD_REQUIRED')
        elif user[0]['status'] == 'DEL':
            error = gettext('USER_DELETED')
        elif user[0]['enabled'] == 0:
            error = gettext('USER_DISABLED')

        if error is None:
            session.clear()
            encoded_token = encode_auth_token(user[0]['id'])
            session['lang'] = lang

            response = {
                'auth_token': encoded_token[0].decode(),
                'days_before_exp': encoded_token[1],
                'user': db.select({
                    'select': ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'creation_date', 'enabled'],
                    'table': ['users'],
                    'where': ['username = ?'],
                    'data': [username]
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
            db = get_db()
            error = None
            user = db.select({
                'select': ['id'],
                'table': ['users'],
                'where': ['username = ?'],
                'data': [username]
            })

            if not username:
                error = gettext('USERNAME_REQUIRED')
            elif not password:
                error = gettext('PASSWORD_REQUIRED')
            elif user:
                error = gettext('USER') + ' ' + username + ' ' + gettext('ALREADY_REGISTERED')

            if error is None:
                db.insert({
                    'table': 'users',
                    'columns': {
                        'username': username,
                        'firstname': firstname,
                        'lastname': lastname,
                        'password': generate_password_hash(password),
                    }
                })
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
            except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError, jwt.ExpiredSignatureError) as e:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": str(e)}), 500

            db = get_db()
            user = db.select({
                'select': ['*'],
                'table': ['users'],
                'where': ['id = ?'],
                'data': [token['sub']]
            })
            if not user:
                return jsonify({"errors": gettext("JWT_ERROR"), "message": "User doesn't exist"}), 500
        else:
            return jsonify({"errors": gettext("JWT_ERROR"), "message": "Valid token is mandatory"}), 500

        return view(**kwargs)

    return wrapped_view
