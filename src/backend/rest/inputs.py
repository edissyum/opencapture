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

from flask_babel import gettext
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, inputs, privileges

bp = Blueprint('inputs', __name__, url_prefix='/ws/')


@bp.route('inputs/<string:module>/list', methods=['GET'])
@auth.token_required
def get_inputs(module):
    list_priv = ['settings', 'inputs_list'] if module == 'verifier' else ['settings', 'inputs_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/inputs/{module}/list'}), 403

    args = dict(request.args)
    args['module'] = module
    _inputs = inputs.get_inputs(args)
    return make_response(jsonify(_inputs[0])), _inputs[1]


@bp.route('inputs/<string:module>/getById/<int:input_id>', methods=['GET'])
@auth.token_required
def get_input_by_id(module, input_id):
    list_priv = ['settings', 'update_input'] if module == 'verifier' else ['settings', 'update_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/inputs/{module}/getById/{input_id}'}), 403

    _input = inputs.get_input_by_id(input_id)
    return make_response(jsonify(_input[0])), _input[1]


@bp.route('inputs/<string:module>/getByInputId/<string:input_id>', methods=['GET'])
@auth.token_required
def get_input_by_input_id(module, input_id):
    if not privileges.has_privileges(request.environ['user_id'], ['monitoring | update_input | update_input_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/inputs/{module}/getById/{input_id}'}), 403

    _input = inputs.get_input_by_input_id(input_id)
    return make_response(jsonify(_input[0])), _input[1]


@bp.route('inputs/<string:module>/getByFormId/<int:form_id>', methods=['GET'])
@auth.token_required
def get_input_by_form_id(module, form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/inputs/{module}/getByFormId/{form_id}'}), 403

    _input = inputs.get_input_by_form_id(form_id)
    return make_response(jsonify(_input[0])), _input[1]


@bp.route('inputs/<string:module>/update/<int:input_id>', methods=['PUT'])
@auth.token_required
def update_input(module, input_id):
    list_priv = ['settings', 'update_input | forms_list'] if module == 'verifier' else ['settings', 'update_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/inputs/{module}/update/{input_id}'}), 403

    data = request.json['args']
    res = inputs.update_input(input_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/<string:module>/duplicate/<int:input_id>', methods=['POST'])
@auth.token_required
def duplicate_input(module, input_id):
    list_priv = ['settings', 'update_input'] if module == 'verifier' else ['settings', 'update_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/inputs/{module}/duplicate/{input_id}'}), 403

    res = inputs.duplicate_input(input_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/<string:module>/delete/<int:input_id>', methods=['DELETE'])
@auth.token_required
def delete_input(module, input_id):
    list_priv = ['settings', 'update_input'] if module == 'verifier' else ['settings', 'update_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/inputs/{module}/delete/{input_id}'}), 403

    res = inputs.delete_input(input_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/<string:module>/create', methods=['POST'])
@auth.token_required
def create_input(module):
    list_priv = ['settings', 'add_input'] if module == 'verifier' else ['settings', 'add_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/inputs/{module}/create'}), 403

    data = request.json['args']
    res = inputs.create_input(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/<string:module>/createScriptAndIncron', methods=['POST'])
@auth.token_required
def create_script_and_incron(module):
    list_priv = ['settings', 'add_input'] if module == 'verifier' else ['settings', 'add_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/inputs/{module}/create'}), 403

    data = request.json['args']
    res = inputs.create_script_and_incron(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('inputs/<string:module>/allowedPath', methods=['GET'])
@auth.token_required
def get_allowed_path(module):
    list_priv = ['settings', 'update_input | add_input'] if module == 'verifier' \
        else ['settings', 'update_input_splitter | add_input_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/inputs/{module}/allowedPath'}), 403
    res = inputs.get_allowed_path()
    return make_response(jsonify(res[0])), res[1]
