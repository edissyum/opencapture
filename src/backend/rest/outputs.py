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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import Blueprint, request, make_response, jsonify
from ..import_controllers import auth, outputs

bp = Blueprint('outputs', __name__, url_prefix='/ws/')


@bp.route('outputs/list', methods=['GET'])
@auth.token_required
def get_outputs():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    _roles = outputs.get_outputs(args)
    return make_response(jsonify(_roles[0])), _roles[1]


@bp.route('outputs/getOutputsTypes', methods=['GET'])
@auth.token_required
def get_outputs_types():
    _roles = outputs.get_outputs_types()
    return make_response(jsonify(_roles[0])), _roles[1]


@bp.route('outputs/getOutputTypeById/<string:output_type_id>', methods=['GET'])
@auth.token_required
def get_output_type_by_id(output_type_id):
    _roles = outputs.get_output_type_by_id(output_type_id)
    return make_response(jsonify(_roles[0])), _roles[1]


@bp.route('outputs/getById/<int:output_id>', methods=['GET'])
@auth.token_required
def get_output_by_id(output_id):
    _role = outputs.get_output_by_id(output_id)
    return make_response(jsonify(_role[0])), _role[1]


@bp.route('outputs/update/<int:output_id>', methods=['PUT'])
@auth.token_required
def update_output(output_id):
    data = request.json['args']
    res = outputs.update_output(output_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/delete/<int:output_id>', methods=['DELETE'])
@auth.token_required
def delete_output(output_id):
    res = outputs.delete_output(output_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('outputs/create', methods=['POST'])
@auth.token_required
def create_output():
    data = request.json['args']
    res = outputs.create_output(data)
    return make_response(jsonify(res[0])), res[1]
