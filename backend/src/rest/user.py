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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from .auth import limiter
from flask_babel import gettext
from ..functions import rest_validator
from ..controllers import auth, user, privileges
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('users', __name__, url_prefix='/ws/')


@bp.route('users/create', methods=['POST'])
@auth.token_required
def create_user():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_user']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/users/new'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'role', 'type': int, 'mandatory': True},
        {'id': 'mode', 'type': str, 'mandatory': True},
        {'id': 'email', 'type': str, 'mandatory': False},
        {'id': 'forms', 'type': list, 'mandatory': False},
        {'id': 'username', 'type': str, 'mandatory': True},
        {'id': 'lastname', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True},
        {'id': 'firstname', 'type': str, 'mandatory': True},
        {'id': 'customers', 'type': list, 'mandatory': False},
        {'id': 'password_check', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = user.create_user(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/list', methods=['GET'])
@auth.token_required
def get_users():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'users_list | user_quota']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/users/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'role', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'order', 'type': str, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False},
        {'id': 'search', 'type': str, 'mandatory': False},
        {'id': 'filter', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    _users = user.get_users(request.args)
    return make_response(jsonify(_users[0])), _users[1]


@bp.route('users/list_full', methods=['GET'])
@auth.token_required
def get_users_full():
    if not privileges.has_privileges(request.environ['user_id'], ['history | statistics']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/users/list_full'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False},
        {'id': 'search', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    _users = user.get_users_full(request.args)
    return make_response(jsonify(_users[0])), _users[1]


@bp.route('users/getById/<int:user_id>', methods=['GET'])
@auth.token_required
def get_user_by_id(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_user']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/getById/{user_id}'}), 403

    _user = user.get_user_by_id(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('users/profile/<int:user_id>/<int:logged_in_user>', methods=['GET'])
@auth.token_required
def get_profile(user_id, logged_in_user):
    if logged_in_user != user_id:
        if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_user']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/profile/{user_id}/{logged_in_user}'}), 403

    _user = user.get_user_by_id(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('users/sendEmailForgotPassword', methods=['POST'])
def send_email_forgot_password():
    check, message = rest_validator(request.json, [
        {'id': 'userId', 'type': int, 'mandatory': False},
        {'id': 'currentUrl', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = user.send_email_forgot_password(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/resetPassword', methods=['PUT'])
@limiter.limit("3/minute")
def reset_password():
    check, message = rest_validator(request.json, [
        {'id': 'resetToken', 'type': str, 'mandatory': False},
        {'id': 'newPassword', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = user.reset_password(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/getByMail', methods=['POST'])
def get_user_by_mail():
    check, message = rest_validator(request.json, [
        {'id': 'email', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    _user = user.get_user_by_mail(request.json['email'])
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('users/update/<int:user_id>', methods=['PUT'])
@auth.token_required
def update_user(user_id):
    if request.environ['fromBasicAuth']:
        if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_user']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/update/{user_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'role', 'type': int, 'mandatory': False},
        {'id': 'mode', 'type': str, 'mandatory': False},
        {'id': 'email', 'type': str, 'mandatory': False},
        {'id': 'forms', 'type': list, 'mandatory': False},
        {'id': 'lastname', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': False},
        {'id': 'firstname', 'type': str, 'mandatory': True},
        {'id': 'customers', 'type': list, 'mandatory': False},
        {'id': 'password_check', 'type': str, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = user.update_user(user_id, request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/delete/<int:user_id>', methods=['DELETE'])
@auth.token_required
def delete_user(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'users_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/delete/{user_id}'}), 403

    res = user.delete_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/disable/<int:user_id>', methods=['PUT'])
@auth.token_required
def disable_user(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'users_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/disable/{user_id}'}), 403

    res = user.disable_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/enable/<int:user_id>', methods=['PUT'])
@auth.token_required
def enable_user(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'users_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/enable/{user_id}'}), 403

    res = user.enable_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/getCustomersByUserId/<int:user_id>', methods=['GET'])
@auth.token_required
def get_customers_by_user_id(user_id):
    res = user.get_customers_by_user_id(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/getFormsByUserId/<int:user_id>', methods=['GET'])
@auth.token_required
def get_forms_by_user_id(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_user']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/users/getFormsByUserId/{user_id}'}), 403

    res = user.get_forms_by_user_id(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/csv/import', methods=['POST'])
@auth.token_required
def import_users():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_user', 'update_user']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/users/csv/import'}), 403
    args = {
        'files': request.files,
        'skip_header': request.form['skipHeader'] == 'true',
        'selected_columns': request.form['selectedColumns'].split(',')
    }

    res = user.import_users(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/export', methods=['POST'])
@auth.token_required
def export_users():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'users_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/users/export'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'columns', 'type': list, 'mandatory': True},
        {'id': 'delimiter', 'type': str, 'mandatory': True},
        {'id': 'extension', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = user.export_users(request.json['args'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/getDefaultRoute/<int:user_id>', methods=['GET'])
@auth.token_required
def get_default_route(user_id):
    res = user.get_default_route(user_id)
    return make_response(jsonify(res[0])), res[1]
