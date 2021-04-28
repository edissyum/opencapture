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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask import Blueprint, request, make_response, jsonify
from ..controllers.auth import token_required
from ..controllers import user

bp = Blueprint('user', __name__, url_prefix='/ws/')


@bp.route('user/list', methods=['GET'])
@token_required
def get_users():
    args = {'select': ['*', 'count(*) OVER() as total', ], 'offset': request.args['offset'], 'limit': request.args['limit']}
    _users = user.retrieve_users(args)

    return make_response(jsonify(_users[0])), _users[1]


@bp.route('user/getById/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(user_id):
    _user = user.retrieve_user_by_id(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('user/update/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    data = request.json['args']
    res = user.update_user(user_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('user/delete/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    res = user.delete_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('user/disable/<int:user_id>', methods=['PUT'])
@token_required
def disable_user(user_id):
    res = user.disable_user(user_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('user/enable/<int:user_id>', methods=['PUT'])
@token_required
def enable_user(user_id):
    res = user.enable_user(user_id)
    return make_response(jsonify(res[0])), res[1]
