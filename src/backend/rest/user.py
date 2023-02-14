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

from src.backend.import_controllers import auth, user
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('users', __name__, url_prefix='/ws/')


@bp.route('users/new', methods=['POST'])
def create_user():
    data = request.json
    res = user.create_user(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/list', methods=['GET'])
@auth.token_required
def get_users():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status NOT IN (%s)', "role <> 1"],
        'data': ['DEL'],
        'offset': request.args['offset'] if 'offset' in request.args else 0,
        'limit': request.args['limit'] if 'limit' in request.args else 'ALL'
    }

    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(username) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(firstname) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(lastname) LIKE '%%" + request.args['search'].lower() + "%%')"
        )
    _users = user.get_users(args)
    return make_response(jsonify(_users[0])), _users[1]


@bp.route('users/list_full', methods=['GET'])
@auth.token_required
def get_users_full():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else 0,
        'limit': request.args['limit'] if 'limit' in request.args else 'ALL'
    }
    _users = user.get_users_full(args)
    return make_response(jsonify(_users[0])), _users[1]


@bp.route('users/getById/<int:user_id>', methods=['GET'])
@auth.token_required
def get_user_by_id(user_id):
    _user = user.get_user_by_id(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('users/sendEmailForgotPassword', methods=['POST'])
def send_email_forgot_password():
    data = request.json
    res = user.send_email_forgot_password(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/resetPassword', methods=['PUT'])
def reset_password():
    data = request.json
    res = user.reset_password(data)
    return make_response(jsonify(res[0])), res[1]



@bp.route('users/getByMail', methods=['POST'])
def get_user_by_mail():
    data = request.json
    _user = user.get_user_by_mail(data['email'])
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('users/update/<int:user_id>', methods=['PUT'])
@auth.token_required
def update_user(user_id):
    data = request.json['args']
    res = user.update_user(user_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/delete/<int:user_id>', methods=['DELETE'])
@auth.token_required
def delete_user(user_id):
    res = user.delete_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/disable/<int:user_id>', methods=['PUT'])
@auth.token_required
def disable_user(user_id):
    res = user.disable_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/enable/<int:user_id>', methods=['PUT'])
@auth.token_required
def enable_user(user_id):
    res = user.enable_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/getCustomersByUserId/<int:user_id>', methods=['GET'])
@auth.token_required
def get_customers_by_user_id(user_id):
    res = user.get_customers_by_user_id(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('users/customers/update/<int:user_id>', methods=['PUT'])
@auth.token_required
def update_customers_by_user_id(user_id):
    customers = request.json['customers']
    res = user.update_customers_by_user_id(user_id, customers)
    return make_response(jsonify(res[0])), res[1]
