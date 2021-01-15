from flask import Blueprint, g, request, make_response, jsonify
from ..auth import token_required
from .. import user

bp = Blueprint('user', __name__, url_prefix='/ws/')


@bp.route('user/getUserById/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(user_id):
    _user = user.check_user(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('user/updateUser/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    data = request.json['args']
    res = user.update_profile(user_id, data)
    return make_response(jsonify(res[0])), res[1]
