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

from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, inputs

bp = Blueprint('inputs', __name__, url_prefix='/ws/')


@bp.route('inputs/list', methods=['GET'])
@auth.token_required
def get_inputs():
    args = {
        'module': request.args['module'],
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'user_id': request.args['userId'] if 'userId' in request.args else None
    }
    _inputs = inputs.get_inputs(args)
    return make_response(jsonify(_inputs[0])), _inputs[1]


@bp.route('inputs/getById/<int:input_id>', methods=['GET'])
@auth.token_required
def get_input_by_id(input_id):
    _input = inputs.get_input_by_id(input_id)
    return make_response(jsonify(_input[0])), _input[1]


@bp.route('inputs/getByFormId/<int:form_id>', methods=['GET'])
@auth.token_required
def get_input_by_form_id(form_id):
    _input = inputs.get_input_by_form_id(form_id)
    return make_response(jsonify(_input[0])), _input[1]


@bp.route('inputs/update/<int:input_id>', methods=['PUT'])
@auth.token_required
def update_input(input_id):
    data = request.json['args']
    res = inputs.update_input(input_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/duplicate/<int:input_id>', methods=['POST'])
@auth.token_required
def duplicate_input(input_id):
    res = inputs.duplicate_input(input_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/delete/<int:input_id>', methods=['DELETE'])
@auth.token_required
def delete_input(input_id):
    res = inputs.delete_input(input_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/create', methods=['POST'])
@auth.token_required
def create_input():
    data = request.json['args']
    res = inputs.create_input(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/createScriptAndIncron', methods=['POST'])
@auth.token_required
def create_script_and_incron():
    data = request.json['args']
    res = inputs.create_script_and_incron(data)
    return make_response(jsonify(res[0])), res[1]
