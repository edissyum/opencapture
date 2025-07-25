# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Essaid MEGHELLET <essaid.meghellet@edissyum.com>


import jwt
import uuid
import ldap3
import base64
import psycopg
import functools
from ldap3 import Server, ALL
from flask_babel import gettext
from src.backend.controllers import privileges
from ldap3.core.exceptions import LDAPException
from datetime import datetime, timezone, timedelta
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.models import auth, user, roles, monitoring, history
from werkzeug.security import generate_password_hash, check_password_hash
from flask import request, g as current_context, jsonify, current_app, session


def handle_login(data):
    login_method = get_enabled_login_method()
    enabled_login_method = [{'method_name': 'default'}]
    if login_method and 'login_method_name' in login_method[0] and login_method[0]['login_method_name']:
        enabled_login_method = login_method[0]['login_method_name']

    res = check_connection()
    if enabled_login_method and enabled_login_method[0]['method_name'] == 'default':
        if res is None:
            if 'username' in data and 'password' in data:
                res = login(data['username'], data['password'], data['lang'])
                if res[1] == 200 and data['username'] == 'admin' and data['password'] == 'admin':
                    res[0]['admin_password_alert'] = 'True'
            elif 'token' in data:
                res = login_with_token(data['token'], data['lang'])
            else:
                res = ('', 402)
        else:
            res = [{
                "errors": gettext('PGSQL_ERROR'),
                "message": res.replace('\n', '')
            }, 401]
    elif enabled_login_method and enabled_login_method[0]['method_name'] == 'ldap':
        if res is None:
            if 'token' in data:
                res = login_with_token(data['token'], data['lang'])
            else:
                is_user_exists = verify_user_by_username(data['username'])
                if is_user_exists and is_user_exists[1] == 200:
                    role_id = get_user_role_by_username(data['username'])
                    if role_id and role_id == 'superadmin':
                        res = login(data['username'], data['password'], data['lang'])
                    else:
                        configs = get_ldap_configurations()
                        if configs and configs[0]['ldap_configurations']:
                            res = ldap_connection_bind(configs, data)
                        else:
                            error = configs[0]['message']
                            res = [{
                                "errors": error
                            }, 401]
                else:
                    res = [{
                        "errors": gettext('LOGIN_ERROR'),
                        "message": gettext('BAD_AUTHENTICATION')
                    }, 401]
        else:
            res = [{
                "errors": gettext('PGSQL_ERROR'),
                "message": res.replace('\n', '')
            }, 401]

    if res[1] == 200:
        res[0]['refresh_token'] = encode_auth_token(res[0]['user']['id'], refresh_token=True)[0]
        user.update_user({'set': {'refresh_token': res[0]['refresh_token']}, 'user_id': res[0]['user']['id']})

    return res


def get_user(user_info):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    configurations = _vars[10]

    if configurations['allowUserMultipleLogin'] is not True:
        last_connection = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        user.update_user({'set': {'last_connection': last_connection}, 'user_id': user_info['id']})

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
    return returned_user


def refresh(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms="HS512")
        user_id = payload['sub']

        user_info = user.get_user_by_id({'select': ['refresh_token'], 'user_id': user_id})
        if user_info:
            user.update_user({'set': {'refresh_token': ''}, 'user_id': user_id})
            if user_info[0]['refresh_token'] == token:
                res = {
                    'token': encode_auth_token(user_id)[0],
                    'user': get_user({'id': user_id})
                }
                return res, 200
            else:
                return '', 401
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        code = 500
        if error_message == 'Signature has expired':
            code = 401
            error_message = gettext('SESSION_EXPIRED')
        return jsonify({"errors": gettext("JWT_ERROR"), "message": error_message}), code
    return '', 200


def check_connection():
    if 'config' in current_context:
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]
    db_user = config['DATABASE']['postgresuser']
    db_host = config['DATABASE']['postgreshost']
    db_port = config['DATABASE']['postgresport']
    db_pwd = config['DATABASE']['postgrespassword']
    db_name = config['DATABASE']['postgresdatabase']
    try:
        psycopg.connect(dbname=db_name, user=db_user, password=db_pwd, host=db_host, port=db_port)
    except (psycopg.OperationalError, psycopg.ProgrammingError) as _e:
        return str(_e).split('\n', maxsplit=1)[0]


def check_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        code = 500
        if error_message == 'Signature has expired':
            code = 401
            error_message = gettext('SESSION_EXPIRED')
        return {"errors": gettext("JWT_ERROR"), "message": error_message}, code
    return payload, 200


def generate_token(user_id, days_before_exp):
    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(days=days_before_exp),
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS512'
        ), 200
    except (Exception,) as _e:
        return str(_e), 500


def encode_auth_token(user_id, refresh_token=False):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]
    minutes_before_exp = int(configurations['jwtExpiration'])

    try:
        time_delta = timedelta(minutes=minutes_before_exp)
        if refresh_token:
            time_delta = timedelta(days=1)

        payload = {
            'exp': datetime.now(timezone.utc) + time_delta,
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        if refresh_token:
            payload['refresh'] = True

        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS512'
        ), minutes_before_exp
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        if error_message == 'Signature has expired':
            error_message = gettext('SESSION_EXPIRED')
        return error_message


def generate_unique_url_token(token, workflow_id, module):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    form_settings = None
    days_before_exp = None
    error = True

    if workflow_id:
        form_settings = database.select({
            "select": ["settings", "input", "process"],
            "table": ["form_models", "workflows"],
            "left_join": ["form_models.id::TEXT = workflows.process ->> 'form_id'"],
            "where": ["workflows.workflow_id = %s", 'form_models.module = %s'],
            "data": [workflow_id, module]
        })

        if form_settings:
            form_settings = form_settings[0]
            if form_settings['input']['apply_process'] and form_settings['process']['use_interface']:
                if form_settings['process']['form_id']:
                    error = False

    if not error and form_settings:
        if form_settings['settings'] and 'unique_url' in form_settings['settings']:
            if form_settings['settings']['unique_url']:
                days_before_exp = int(form_settings['settings']['unique_url']['expiration'])

    if days_before_exp is None or error:
        return False

    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(days=days_before_exp),
            'iat': datetime.now(timezone.utc),
            'process_token': token
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS512'
        )
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        if error_message == 'Signature has expired':
            error_message = gettext('SESSION_EXPIRED')
        return error_message


def generate_reset_token(user_id):
    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(minutes=3600),
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS512'
        )
    except (Exception,) as _e:
        return str(_e)


def decode_reset_token(token):
    try:
        decoded_token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        code = 500
        if error_message == 'Signature has expired':
            code = 401
            error_message = gettext('SESSION_EXPIRED')
        return {"errors": gettext("RESET_JWT_ERROR"), "message": error_message}, code
    return decoded_token, 200


def decode_unique_url_token(token):
    try:
        decoded_token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        code = 500
        if error_message == 'Signature has expired':
            code = 401
            error_message = gettext('SESSION_EXPIRED')
        return {"errors": gettext("UNIQUE_URL_JWT_ERROR"), "message": error_message}, code
    return decoded_token, 200


def logout(user_id):
    for key in list(session.keys()):
        session.pop(key)

    if 'ocr' in current_context:
        current_context.pop('ocr')
    if 'log' in current_context:
        current_context.pop('log')
    if 'smtp' in current_context:
        current_context.pop('smtp')
    if 'regex' in current_context:
        current_context.pop('regex')
    if 'files' in current_context:
        current_context.pop('files')
    if 'database' in current_context:
        current_context.pop('database')
    if 'languages' in current_context:
        current_context.pop('languages')
    if 'docservers' in current_context:
        current_context.pop('docservers')
    if 'spreadsheet' in current_context:
        current_context.pop('spreadsheet')
    if 'configurations' in current_context:
        current_context.pop('configurations')

    user_info = user.get_user_by_id({'select': ['lastname', 'firstname', 'username'], 'user_id': user_id})
    if user_info:
        user_info = user_info[0]
        user_info = user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')'

    user.update_user({'set': {'refresh_token': ''}, 'user_id': user_id})

    history.add_history({
        'module': 'general',
        'ip': request.remote_addr,
        'submodule': 'logout',
        'user_info': user_info,
        'user_id': user_id,
        'desc': gettext('LOGOUT')
    })


def login(username, password, lang, method='default'):
    if 'SECRET_KEY' not in current_app.config or not current_app.config['SECRET_KEY']:
        return {
            "errors": gettext('LOGIN_ERROR'),
            "message": 'missing_secret_key'
        }, 401

    session['lang'] = lang
    error = None
    user_info = None

    if method == 'default':
        user_info, error = auth.login({
            'username': username,
            'password': password
        })
        if 'mode' in user_info and user_info['mode'] == 'webservice':
            response = {
                "errors": gettext('LOGIN_ERROR'),
                "message": gettext('USER_WEBSERVICE')
            }
            return response, 401
    elif method == 'ldap':
        user_info, error = user.get_user_by_username({"select": ['users.id', 'users.username'], "username": username})

    if error is None:
        encoded_token = encode_auth_token(user_info['username'])
        returned_user = get_user(user_info)

        response = {
            'auth_token': str(encoded_token[0]),
            'minutes_before_exp': encoded_token[1],
            'user': returned_user
        }

        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'login',
            'user_info': returned_user['lastname'] + ' ' + returned_user['firstname'] + ' (' + returned_user['username'] + ')',
            'desc': gettext('LOGIN')
        })
        return response, 200
    else:
        response = {
            "errors": gettext('LOGIN_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def login_with_token(token, lang):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]
    minutes_before_exp = configurations['jwtExpiration']
    session['lang'] = lang

    try:
        decoded_token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
    except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
            jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
        error_message = str(_e)
        code = 500
        if error_message == 'Signature has expired':
            code = 401
            error_message = gettext('SESSION_EXPIRED')
        return jsonify({"errors": gettext("JWT_ERROR"), "message": error_message}), code

    returned_user = None
    if isinstance(decoded_token['sub'], str):
        user_id = user.get_user_by_username({
            'select': ['users.id'],
            'username': decoded_token['sub']
        })
        if user_id[0]:
            returned_user = get_user({'id': user_id[0]['id']})
    else:
        returned_user = get_user({'id': decoded_token['sub']})

    if not returned_user:
        return jsonify({"errors": gettext("JWT_ERROR"), "message": gettext('USER_DO_NOT_EXISTS')}), 401

    user_privileges = ['*']
    if returned_user['privileges'] != '*':
        user_privileges = privileges.get_privileges_by_role_id({'role_id': returned_user['role']['id']})

    if user_privileges:
        returned_user['privileges'] = user_privileges[0]

    user_role = None
    if returned_user['privileges'] != '*' and returned_user['role']:
        user_role = roles.get_role_by_id({'role_id': returned_user['role']['id']})

    if user_role:
        returned_user['role'] = user_role[0]

    response = {
        'auth_token': str(token),
        'minutes_before_exp': minutes_before_exp,
        'user': returned_user
    }

    history.add_history({
        'module': 'general',
        'ip': request.remote_addr,
        'submodule': 'login',
        'user_info': returned_user['lastname'] + ' ' + returned_user['firstname'] + ' (' + returned_user['username'] + ')',
        'desc': gettext('LOGIN')
    })
    return response, 200


def token_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if 'Authorization' in request.headers:
            where = ['username = %s']
            user_ws = password = False
            token = None
            if 'Bearer' in request.headers['Authorization']:
                token = request.headers['Authorization'].split('Bearer')[1].lstrip()
                try:
                    token = jwt.decode(str(token), current_app.config['SECRET_KEY'], algorithms="HS512")
                    if 'refresh' in token:
                        allowed_refresh_url = ['/ws/auth/login/refresh', '/ws/auth/logout']
                        allow_refresh = [url for url in allowed_refresh_url if url in request.url]
                        if not allow_refresh:
                            return jsonify({"errors": gettext("JWT_ERROR"), "message": gettext('SESSION_EXPIRED')}), 401

                    data = []
                    if 'sub' in token:
                        if isinstance(token['sub'], int):
                            where = ['id = %s']
                        data = [token['sub']]
                    elif 'process_token' in token:
                        data = [token['process_token']]
                except (jwt.InvalidTokenError, jwt.InvalidAlgorithmError, jwt.InvalidSignatureError,
                        jwt.ExpiredSignatureError, jwt.exceptions.DecodeError) as _e:
                    error_message = str(_e)
                    code = 500
                    if error_message == 'Signature has expired':
                        code = 401
                        error_message = gettext('SESSION_EXPIRED')
                    return jsonify({"errors": gettext("JWT_ERROR"), "message": error_message}), code
                request.environ['fromBasicAuth'] = False
            elif 'Basic' in request.headers['Authorization']:
                user_ws = True
                where.append('mode = %s')
                basic_auth = request.headers['Authorization'].split('Basic')[1].lstrip()
                username, password = base64.b64decode(basic_auth).decode('utf-8').split(':')
                data = [username, 'webservice']
                request.environ['fromBasicAuth'] = True
            else:
                return (jsonify({"errors": gettext("JWT_ERROR"), "message": gettext('AUTHORIZATION_HEADER_INCORRECT')}),
                        500)

            user_info, _ = user.get_users({
                'select': ['users.id', 'username', 'lastname', 'firstname', 'last_connection', 'password'],
                'where': where,
                'data': data
            })

            if token and not user_ws:
                if (user_info and user_info[0]['last_connection'] and
                        token['iat'] < datetime.timestamp(user_info[0]['last_connection'])):
                    return jsonify({"errors": gettext("JWT_ERROR"), "message": gettext('ACCOUNT_ALREADY_LOGGED')}), 500

            if token and 'process_token' in token:
                process, _ = monitoring.get_process_by_token(token['process_token'], '')
                allowed_path = [
                    'export_mem',
                    'export_xml',
                    'export_pdf',
                    'updatePage',
                    'export_facturx',
                    'updatePosition',
                    'verifier/getThumb',
                    'verifier/ocrOnFly',
                    'getAccountingPlan',
                    'forms/verifier/list',
                    'verifier/verifySIRET',
                    'verifier/verifySIREN',
                    'forms/verifier/getById',
                    'accounts/getAdressById',
                    'verifier/getTokenINSEE',
                    'accounts/suppliers/list',
                    'verifier/verifyVATNumber',
                    'forms/fields/getByFormId',
                    'outputs/verifier/getById',
                    'getDefaultAccountingPlan',
                    'accounts/suppliers/update',
                    'accounts/addresses/create',
                    'accounts/suppliers/create',
                    'workflows/verifier/getById',
                    'verifier/getThumbByDocumentId',
                    'accounts/addresses/updateBySupplierId'
                ]
                request.environ['user_info'] = 'Token ' + gettext('FIRSTNAME') + ' (token_user)'

                if process and process[0]['document_ids']:
                    for document_id in process[0]['document_ids']:
                        if str(document_id) in request.url:
                            request.environ['skip'] = True
                            return view(**kwargs)
                    for path in allowed_path:
                        if path in request.url:
                            request.environ['skip'] = True
                            return view(**kwargs)

            if not user_info:
                error = gettext("JWT_ERROR")
                if user_ws:
                    error = gettext("REST_ERROR")
                return jsonify({"errors": error, "message": gettext('USER_DO_NOT_EXISTS')}), 500

            if user_ws:
                if not check_password_hash(user_info[0]['password'], password):
                    return jsonify({"errors": gettext("REST_ERROR"), "message": gettext('PASSWORD_INCORRECT')}), 500

            request.environ['user_id'] = user_info[0]['id']
            request.environ['user_info'] = user_info[0]['lastname'] + ' ' + user_info[0]['firstname'] + ' (' + user_info[0]['username'] + ')'
        else:
            return jsonify({"errors": gettext("AUTH_ERROR"), "message": gettext('VALID_TOKEN_OR_USER_WS_MANDATORY')}), 500
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
            "message": gettext(error)
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
            "message": gettext(error)
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


def update_login_method(login_method_name, server_data):
    _, error = auth.update_login_method(login_method_name, server_data)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_LOGIN_METHOD_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def retrieve_login_methods():
    login_methods, error = auth.retrieve_login_methods()
    if error is None:
        response = {
            "login_methods": login_methods
        }
        return response, 200

    response = {
        "errors": gettext('LOADING_METHODS_AUTH_ERROR'),
        "message": gettext(error)
    }
    return response, 401


def disable_login_method(method_name):
    _, error = auth.disable_login_method(method_name)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('DISABLE_LOGIN_METHOD_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def enable_login_method(method_name):
    _, error = auth.enable_login_method(method_name)
    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('ENABLE_LOGIN_METHOD_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def ldap_connection_bind(ldap_configs, data):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]

    ldap_configurations = ldap_configs[0]['ldap_configurations']
    data_ldap_configs = ldap_configurations[0]['data']
    type_ad = data_ldap_configs['typeAD']
    domain_ldap = data_ldap_configs['host']
    port_ldap = data_ldap_configs['port']
    username_ldap_admin = data_ldap_configs['loginAdmin']
    password_ldap_admin = data_ldap_configs['passwordAdmin']
    base_dn = data_ldap_configs['baseDN']
    suffix = data_ldap_configs['suffix'] if 'suffix' in data_ldap_configs else ''
    prefix = data_ldap_configs['prefix'] if 'prefix' in data_ldap_configs else ''
    username_attribute = data_ldap_configs['attributSourceUser']
    user_connection_status = check_user_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix, username_attribute, data['username'], data['password'], log)
    if user_connection_status:
        res = login(data['username'], None, data['lang'], 'ldap')
    else:
        res = [{
            "errors": gettext('LDAP_CONNECTION_ERROR'),
            "message": gettext('LOGIN_LDAP_ERROR')
        }, 401]

    return res


def check_user_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix, username_attribute, username, password, log):
    ldap_server = domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldap_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_dn, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, password, log)
                        if not connection_status:
                            return False
                        else:
                            return True
        elif type_ad == 'adLDAP':
            server = Server(ldap_server, get_info=ALL)
            if prefix or suffix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True) as connection:
                if not connection.bind():
                    return False
                else:
                    status = connection.search(search_base=base_dn, search_filter=f'({username_attribute}={username})',
                                               search_scope='SUBTREE',
                                               attributes=['*'])
                    user_dn = connection.response[0]['dn']
                    if status and user_dn:
                        connection_status = check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, password, log)
                        if not connection_status:
                            return False
                        else:
                            return True

    except LDAPException:
        return False


def verify_ldap_server_connection(server_ldap_data):
    type_ad = server_ldap_data['typeAD']
    domain_ldap = server_ldap_data['host']
    port_ldap = server_ldap_data['port']
    username_ldap_admin = server_ldap_data['loginAdmin']
    password_ldap_admin = server_ldap_data['passwordAdmin']
    base_dn = server_ldap_data['baseDN']
    suffix = server_ldap_data['suffix'] if 'suffix' in server_ldap_data else ''
    prefix = server_ldap_data['prefix'] if 'prefix' in server_ldap_data else ''

    _, error = ldap_server_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin,
                                      base_dn, suffix, prefix)
    if error is None:
        response = ['', 200]
    else:
        response = [error, 401]

    return response


def synchronization_ldap_users(ldap_synchronization_data):
    ldap_synchronization_result, error = ldap_users_synchro(ldap_synchronization_data)

    if error is None:
        response = [ldap_synchronization_result, 200]
    else:
        response = [error, 401]

    return response


def connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix):
    ldap_server = domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            username_admin = f'cn={username_ldap_admin},{base_dn}'
            server = Server(ldap_server, get_info=ALL, use_ssl=True)
            with ldap3.Connection(server, user=username_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
        elif type_ad == 'adLDAP':
            server = Server(ldap_server, get_info=ALL)
            if suffix or prefix:
                username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'
            with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin,
                                  auto_bind=True) as connection:
                if not connection.bind():
                    return {'status_server_ldap': False, 'connection_object': None}
                else:
                    return {'status_server_ldap': True, 'connection_object': connection}
    except LDAPException:
        return {'status_server_ldap': False, 'connection_object': None}


def check_user_ldap_connection(type_ad, domain_ldap, port_ldap, user_dn, user_password, log):
    if not user_dn and not user_password:
        return False
    ldap_server = domain_ldap + ":" + str(port_ldap) + ""
    try:
        if type_ad == 'openLDAP':
            server = Server(ldap_server, get_info=ALL, use_ssl=True)
        elif type_ad == 'adLDAP':
            server = Server(ldap_server, get_info=ALL)
        else:
            return False
        with ldap3.Connection(server, authentication="SIMPLE", user=user_dn, password=user_password,
                              auto_bind=True) as connection:
            if connection.bind():
                return True
            log.error(f"LDAP connection error : {connection.last_error}")
            return False

    except LDAPException as e:
        log.error("LDAP connection error : ", str(e))
        return False



def get_ldap_users(connection, class_user, object_class, users_dn, base_dn):
    try:
        if not users_dn:
            status = connection.search(search_base=base_dn, search_filter=f'({class_user}={object_class})',
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        else:
            status = connection.search(search_base=base_dn, search_filter=users_dn,
                                       search_scope='SUBTREE',
                                       attributes=['*'])
        if connection and status:
            return {'status_search': True, 'ldap_users': connection.entries}
        else:
            return {'status_search': False, 'ldap_users': ""}
    except LDAPException:
        return False


def ldap_users_synchro(ldap_synchronization_data):
    error = None
    result_synchro = None
    if ldap_synchronization_data:
        attribut_source_user = ldap_synchronization_data['attributSourceUser']
        class_object = ldap_synchronization_data['classObject']
        class_user = ldap_synchronization_data['classUser']
        attribut_first_name = ldap_synchronization_data['attributFirstName']
        attribut_last_name = ldap_synchronization_data['attributLastName']
        attribut_role_default = ldap_synchronization_data['attributRoleDefault']
        users_dn = ldap_synchronization_data['usersDN'] if 'usersDN' in ldap_synchronization_data else ''
        type_ad = ldap_synchronization_data['typeAD']
        domain_ldap = ldap_synchronization_data['host']
        port_ldap = ldap_synchronization_data['port']
        username_ldap_admin = ldap_synchronization_data['loginAdmin']
        password_ldap_admin = ldap_synchronization_data['passwordAdmin']
        base_dn = ldap_synchronization_data['baseDN']
        suffix = ldap_synchronization_data['suffix'] if 'suffix' in ldap_synchronization_data else ''
        prefix = ldap_synchronization_data['prefix'] if 'prefix' in ldap_synchronization_data else ''
        if type_ad and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin and base_dn:
            ldap_connection = connection_ldap(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix)
            if attribut_source_user and class_user and class_object and attribut_first_name and attribut_last_name and attribut_role_default:
                if ldap_connection['status_server_ldap']:
                    list_ldap_users = get_ldap_users(ldap_connection['connection_object'], class_user, class_object, users_dn,
                                                     base_dn)
                    if list_ldap_users and list_ldap_users['status_search'] is True:
                        ldap_users_data = get_ldap_users_data(list_ldap_users, attribut_source_user, attribut_first_name,
                                                              attribut_last_name)
                        if ldap_users_data and ldap_users_data['status_search']:
                            result_synchro = check_database_users(ldap_users_data['ldap_users_data'], attribut_role_default)
                        else:
                            error = {
                                "errors": gettext('LDAP_SYNCHRO_ERROR'),
                                "message": gettext('LDAP_SYNCHRO_INFOS_ERROR')
                            }
                    else:
                        error = {
                            "errors": gettext('LDAP_SYNCHRO_ERROR'),
                            "message": gettext('LDAP_SYNCHRO_INFOS_ERROR')
                        }
                else:
                    error = {
                        "errors": gettext('LDAP_SYNCHRO_ERROR'),
                        "message": gettext('LDAP_CONNECTION_ERROR')
                    }
            else:
                error = {
                    "errors": gettext('LDAP_SYNCHRO_ERROR'),
                    "message": gettext('INFOS_LDAP_NOT_COMPLETE')
                }
        else:
            error = {
                "errors": gettext('LDAP_SYNCHRO_ERROR'),
                "message": gettext('INFOS_LDAP_NOT_COMPLETE')
            }
    return result_synchro, error


def get_ldap_users_data(ldap_users_dict, user_id_attribut, firstname_attribut, lastname_attribut):
    try:
        if ldap_users_dict and ldap_users_dict['status_search'] is True:
            list_users_ldap = ldap_users_dict['ldap_users']
            ldap_users_data = []
            for i in range(len(list_users_ldap)):
                user_data = []
                user_id = list_users_ldap[i][user_id_attribut][0] if user_id_attribut in list_users_ldap[i] else ''
                givenname = list_users_ldap[i][firstname_attribut][0] if firstname_attribut in list_users_ldap[i] else ''
                lastname = list_users_ldap[i][lastname_attribut][0] if lastname_attribut in list_users_ldap[i] else ''
                if user_id and givenname and lastname:
                    user_data.append(user_id)
                    user_data.append(givenname)
                    user_data.append(lastname)
                    ldap_users_data.append(user_data)
            return {'status_search': True, 'ldap_users_data': ldap_users_data}
        else:
            return False
    except ldap3.core.exceptions.LDAPKeyError:
        return False


def ldap_server_connection(type_ad, domain_ldap, port_ldap, username_ldap_admin, password_ldap_admin, base_dn, suffix, prefix):
    error = None
    ldap_connection_status = False
    if type_ad and domain_ldap and port_ldap and username_ldap_admin and password_ldap_admin:
        ldap_server = domain_ldap + ":" + str(port_ldap) + ""
        try:
            if type_ad == 'openLDAP':
                username_admin = f'cn={username_ldap_admin},{base_dn}'
                server = Server(ldap_server, get_info=ALL, use_ssl=True)
                with ldap3.Connection(server, user=username_admin, password=password_ldap_admin, auto_bind=True,
                                      receive_timeout=10) as connection:
                    if not connection.bind():
                        error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
                        error = {
                            "errors": gettext('LDAP_CONNECTION_ERROR'),
                            "message": error_message
                        }
                    else:
                        ldap_connection_status = True
            elif type_ad == 'adLDAP':
                server = Server(ldap_server, get_info=ALL)
                if prefix or suffix:
                    username_ldap_admin = f'{prefix}{username_ldap_admin}{suffix}'

                with ldap3.Connection(server, user=username_ldap_admin, password=password_ldap_admin, auto_bind=True,
                                      receive_timeout=10) as connection:
                    if not connection.bind():
                        error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
                        error = {
                            "errors": gettext('LDAP_CONNECTION_ERROR'),
                            "message": error_message
                        }
                    else:
                        ldap_connection_status = True
        except ldap3.core.exceptions.LDAPInvalidServerError:
            error_message = gettext('BAD_CONNECTION_LDAP_INFOS')
            error = {
                "errors": gettext('LDAP_CONNECTION_ERROR'),
                "message": error_message
            }

        except LDAPException as err:
            error = {
                "errors": gettext('LDAP_CONNECTION_ERROR'),
                "message": str(err)
            }
    else:
        error_message = gettext('NOT_COMPLETE_CONNECTION_INFOS')
        error = {
            "errors": gettext('INFOS_LDAP_NOT_COMPLETE'),
            "message": error_message
        }
    return ldap_connection_status, error


def check_database_users(ldap_users_data, default_role):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)

    oc_users = []
    create_users = 0
    update_users = 0
    disabled_users = 0

    users_list = user.get_users({
        'select': ['*'],
        'where': ['status <> %s', 'mode <> %s'],
        'data': ['DEL', 'webservice']
    })[0]
    if users_list:
        for user_info in users_list:
            oc_users.append([user_info['username'], user_info['firstname'], user_info['lastname'], user_info['id']])
    for ldap_user in ldap_users_data:
        for oc_user in oc_users:
            if ldap_user[0] == oc_user[0]:
                if ldap_user[1] == oc_user[1] and ldap_user[2] == oc_user[2]:
                    user_status = user.get_users({
                        'select': ['enabled'],
                        'where': ['username = %s'],
                        'data': [oc_user[0]]
                    })[0]
                    if user_status and len(user_status) >= 1 and not user_status[0]['enabled']:
                        user_id = user.get_user_by_username({
                            'select': ['users.id'],
                            'username': oc_user[0]
                        })[0]['id']
                        user.update_user({'set': {'enabled': True}, 'user_id': user_id})
                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
                    ldap_user[0] = 'Same'
                    oc_user[0] = 'Same'
                elif ldap_user[0] != 'Same' and oc_user[0] != 'Same':
                    if (ldap_user[1] != oc_user[1] and ldap_user[2] != oc_user[2]) or (ldap_user[1] != oc_user[1] and ldap_user[2] == oc_user[2]) or (ldap_user[1] == oc_user[1] and ldap_user[2] != oc_user[2]):
                        user_id = user.get_user_by_username({
                            'select': ['users.id'],
                            'username': oc_user[0]
                        })[0]['id']
                        user.update_user({
                            'set': {
                                'firstname': str(ldap_user[1]),
                                'lastname': str(ldap_user[2]),
                                'role': default_role,
                                'enabled': True
                            },
                            'user_id': user_id
                        })
                        ldap_user[0] = 'Updated'
                        oc_user[0] = 'Updated'
                        update_users += 1
    for oc_user in oc_users:
        if oc_user[0] != 'Same' and oc_user[0] != 'Updated':
            user_oc_status = user.get_users({
                'select': ['enabled'],
                'where': ['username = %s'],
                'data': [oc_user[0]]
            })[0]
            if user_oc_status != '' and user_oc_status:
                is_user_superadmin = auth.get_user_role_by_username(oc_user[0])
                if is_user_superadmin[0] != 'superadmin':
                    user.update_user_ldap({
                        'set': {
                            'enabled': False
                        },
                        'username': oc_user[0],
                        'role': 1
                    })
                    disabled_users += 1
                else:
                    continue
    for user_to_create in ldap_users_data:
        if user_to_create[0] != 'Same' and user_to_create[0] != 'Updated':
            random_password = str(uuid.uuid4())
            hash_password = generate_password_hash(random_password)
            new_user = user.create_user({
                'username': user_to_create[0],
                'firstname': user_to_create[1],
                'lastname': user_to_create[2],
                'email': '',
                'password': hash_password,
                'role': default_role,
                'customers': [],
                'forms': []
            })
            if new_user:
                user_to_create[0] = 'Created'
                create_users += 1
    return {'create_users': create_users, 'disabled_users': disabled_users, 'update_users': update_users}
