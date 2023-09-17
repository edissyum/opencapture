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
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, workflow, privileges

bp = Blueprint('workflow', __name__, url_prefix='/ws/')


@bp.route('workflows/<string:module>/verifyInputFolder', methods=['POST'])
@auth.token_required
def verify_input_folder(module):
    list_priv = ['settings', 'add_workflow | update_workflow'] if module == 'verifier' else ['add_workflow_splitter | update_workflow_splitter']

    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/verifyInputFolder'}), 403

    res = workflow.verify_input_folder(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/create', methods=['POST'])
@auth.token_required
def create_workflow(module):
    list_priv = ['settings', 'add_workflow'] if module == 'verifier' else ['settings', 'add_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/workflows/{module}/create'}), 403

    args = dict(request.json['args'])
    args['module'] = module
    check, message = rest_validator(args, [
        {'id': 'module', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = workflow.create_workflow(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/list', methods=['GET'])
@auth.token_required
def get_workflows(module):
    list_priv = ['settings', 'workflows_list'] if module == 'verifier' else ['upload | workflows_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/workflows/{module}/list'}), 403

    args = dict(request.args)
    args['module'] = module
    _workflows = workflow.get_workflows(args)
    return make_response(jsonify(_workflows[0])), _workflows[1]


@bp.route('workflows/<string:module>/getById/<int:workflow_id>', methods=['GET'])
@auth.token_required
def get_workflow_by_id(workflow_id, module):
    if 'skip' not in request.environ or not request.environ['skip']:
        list_priv = ['settings', 'update_workflow'] if module == 'verifier' else ['settings', 'update_workflow_splitter']
        if not privileges.has_privileges(request.environ['user_id'], list_priv):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/workflows/{module}/getById/{workflow_id}'}), 403

    _workflow = workflow.get_workflow_by_id(workflow_id)
    return make_response(jsonify(_workflow[0])), _workflow[1]


@bp.route('workflows/<string:module>/getByWorkflowId/<string:workflow_id>', methods=['GET'])
@auth.token_required
def get_workflow_by_workflow_id(workflow_id, module):
    list_priv = ['settings | monitoring', 'update_workflow | monitoring'] if module == 'verifier' else ['settings | monitoring', 'update_workflow_splitter | monitoring']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/getByWorkflowId/{workflow_id}'}), 403

    _workflow = workflow.get_workflow_by_workflow_id(workflow_id)
    return make_response(jsonify(_workflow[0])), _workflow[1]


@bp.route('workflows/<string:module>/duplicate/<int:workflow_id>', methods=['POST'])
@auth.token_required
def duplicate_workflow(module, workflow_id):
    list_priv = ['settings', 'update_workflow'] if module == 'verifier' else ['settings', 'update_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/duplicate/{workflow_id}'}), 403

    res = workflow.duplicate_workflow(workflow_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/delete/<int:workflow_id>', methods=['DELETE'])
@auth.token_required
def delete_workflow(module, workflow_id):
    list_priv = ['settings', 'update_workflow'] if module == 'verifier' else ['settings', 'update_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/delete/{workflow_id}'}), 403

    res = workflow.delete_workflow(workflow_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/update/<int:workflow_id>', methods=['PUT'])
@auth.token_required
def update_workflow(module, workflow_id):
    list_priv = ['settings', 'update_workflow'] if module == 'verifier' else ['settings', 'update_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/update/{workflow_id}'}), 403

    data = request.json['args']
    data['module'] = module
    check, message = rest_validator(data, [
        {'id': 'module', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)
    res = workflow.update_workflow(workflow_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/createScriptAndWatcher', methods=['POST'])
@auth.token_required
def create_script_and_watcher(module):
    list_priv = ['settings', 'add_workflow | update_workflow'] if module == 'verifier' else ['settings', 'add_workflow_splitter | update_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/createScriptAndWatcher'}), 403

    args = dict(request.json['args'])
    args['module'] = module
    res = workflow.create_script_and_watcher(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('workflows/<string:module>/getByFormId/<int:form_id>', methods=['GET'])
@auth.token_required
def get_workflows_by_form_id(module, form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_workflow | update_workflow']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflows/{module}/getByFormId/{form_id}'}), 403

    _workflow = workflow.get_workflow_by_form_id(form_id)
    return make_response(jsonify(_workflow[0])), _workflow[1]


@bp.route('workflows/<string:module>/testScript', methods=['POST'])
@auth.token_required
def test_script(module):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_workflow | update_workflow']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/workflows/{module}testScript'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'codeContent', 'type': str, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    if module == 'verifier':
        res = workflow.test_script_verifier(request.json['args'])

    return make_response(jsonify(res[0])), res[1]
