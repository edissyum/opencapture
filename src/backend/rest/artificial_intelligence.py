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

# @dev : Tristan Coulange <tristan.coulange@free.fr>

import json
from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.controllers import auth, artificial_intelligence, doctypes, privileges

bp = Blueprint('ai', __name__, url_prefix='/ws/')


@bp.route('ai/splitter/getTrainDocuments', methods=['GET'])
@auth.token_required
def get_train_documents_splitter():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'list_ai_model_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/ai/splitter/getTrainDocuments'}), 403

    res = artificial_intelligence.splitter_retrieve_documents()
    return make_response(jsonify(res)), 200


@bp.route('ai/verifier/getTrainDocuments', methods=['GET'])
@auth.token_required
def get_train_documents_verifier():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'list_ai_model']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/ai/verifier/getTrainDocuments'}), 403

    res = artificial_intelligence.verifier_retrieve_documents()
    return make_response(jsonify(res)), 200


@bp.route('ai/<string:module>/list', methods=['GET'])
@auth.token_required
def get_ai_models(module):
    list_priv = ['settings', 'list_ai_model'] if module == 'verifier' else ['settings', 'list_ai_model_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/{module}/list'}), 403

    models = artificial_intelligence.get_models(module)
    return make_response(jsonify(models[0])), models[1]


@bp.route('ai/getById/<int:model_id>', methods=['GET'])
@auth.token_required
def get_model_by_id(model_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings',
                                                                  'update_ai_model | update_ai_model_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/getById/{model_id}'}), 403

    model = artificial_intelligence.get_model_by_id(model_id)
    return make_response(jsonify(model[0])), model[1]


@bp.route('ai/<string:module>/trainModel/<string:model_name>', methods=['POST'])
@auth.token_required
def train_model(model_name, module):
    if not privileges.has_privileges(request.environ['user_id'], ['settings',
                                                                  'create_ai_model | create_ai_model_splitter']):
        return jsonify({
            'errors': gettext('UNAUTHORIZED_ROUTE'),
            'message': f'/ai/{module}/trainModel/{model_name}'
        }), 403

    data = json.loads(request.data)
    try:
        artificial_intelligence.launch_train(data, model_name, module)
    except (Exception,) as e:
        return make_response(jsonify({'errors': str(e)})), 500
    return make_response(''), 200


@bp.route('ai/<string:module>/update/<int:model_id>', methods=['POST'])
@auth.token_required
def update_model(model_id, module):
    list_priv = ['settings', 'update_ai_model'] if module == 'verifier' else ['settings', 'update_ai_model_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/{module}/update/{model_id}'}), 403

    data = json.loads(request.data)
    res = artificial_intelligence.rename_model(data['model_path'], model_id, module)
    if res[1] != 200:
        return make_response(jsonify(res[0])), res[1]
    res = artificial_intelligence.update_model(data, model_id, module, True)
    return make_response(jsonify(res)), 200


@bp.route('ai/<string:module>/delete/<int:model_id>', methods=['DELETE'])
@auth.token_required
def delete_model(model_id, module):
    list_priv = ['settings', 'list_ai_model'] if module == 'verifier' else ['settings', 'list_ai_model_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/{module}/delete/{model_id}'}), 403

    args = {'status': 'DEL'}
    res = artificial_intelligence.delete_model(args, model_id, module)
    return make_response(jsonify(res)), 200


@bp.route('ai/<string:module>/testModel/<string:model_name>', methods=['POST'])
@auth.token_required
def test_model(module, model_name):
    list_priv = ['settings', 'list_ai_model'] if module == 'verifier' else ['settings', 'list_ai_model_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/testModel/{model_name}'}), 403

    files = request.files
    res = artificial_intelligence.predict_from_file_content(model_name, files)
    return make_response(jsonify(res[0])), res[1]


@bp.route('ai/list/<string:_type>', methods=['GET'])
@auth.token_required
def retrieve_target_doctypes(_type):
    args = {
        'where': ['type = %s', 'status <> %s'],
        'data': [_type, 'DEL']
    }
    res = doctypes.retrieve_doctypes(args)
    return make_response(jsonify(res[0])), res[1]

@bp.route('ai/llm/list', methods=['GET'])
@auth.token_required
def list_llm_models():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'list_llm_models']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/ai/llm/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'order', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = artificial_intelligence.list_llm_models(request.args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('ai/llm/delete/<int:model_llm_id>', methods=['DELETE'])
@auth.token_required
def delete_llm_model(model_llm_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'list_llm_models']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/llm/delete/{model_llm_id}'}), 403

    res = artificial_intelligence.delete_llm_model(model_llm_id)
    return make_response(jsonify(res)), 200


@bp.route('ai/llm/create', methods=['POST'])
@auth.token_required
def create_llm_model():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_llm_models']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/llm/create'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'name', 'type': str, 'mandatory': True},
        {'id': 'provider', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = artificial_intelligence.create_llm_model(request.json['args'])
    return make_response(jsonify(res[0])), res[1]

@bp.route('ai/llm/getById/<int:model_llm_id>', methods=['GET'])
@auth.token_required
def get_output_by_id(model_llm_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_llm_models']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/ai/llm/getById/{model_llm_id}'}), 403

    _llm_model = artificial_intelligence.get_llm_model_by_id(model_llm_id)
    return make_response(jsonify(_llm_model[0])), _llm_model[1]

@bp.route('ai/llm/update/<int:model_llm_id>', methods=['PUT'])
@auth.token_required
def update_output(model_llm_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_llm_models']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/ai/llm/update/{model_llm_id}'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'url', 'type': str, 'mandatory': True},
        {'id': 'name', 'type': str, 'mandatory': True},
        {'id': 'api_key', 'type': str, 'mandatory': True},
        {'id': 'provider', 'type': str, 'mandatory': True},
        {'id': 'settings', 'type': dict, 'mandatory': False},
        {'id': 'json_content', 'type': dict, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = artificial_intelligence.update_llm_model(model_llm_id, request.json['args'])
    return make_response(jsonify(res[0])), res[1]
