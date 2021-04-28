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

from flask import Blueprint, request, make_response, jsonify
from ..controllers.auth import token_required
from ..controllers import roles

bp = Blueprint('roles', __name__, url_prefix='/ws/')


@bp.route('roles/list', methods=['GET'])
@token_required
def retrieve_roles():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    _roles = roles.retrieve_roles(args)
    return make_response(jsonify(_roles[0])), _roles[1]


@bp.route('roles/delete/<int:role_id>', methods=['DELETE'])
@token_required
def delete_user(role_id):
    res = roles.delete_role(role_id)
    return make_response(jsonify(res[0])), res[1]