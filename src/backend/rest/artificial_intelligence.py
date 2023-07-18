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

# @dev : Tristan Coulange <tristan.coulange@free.fr>

import json
from flask_babel import gettext
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, artificial_intelligence, doctypes, privileges

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
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_ai_model | update_ai_model_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/ai/getById/{model_id}'}), 403

    model = artificial_intelligence.get_model_by_id(model_id)
    return make_response(jsonify(model[0])), model[1]


@bp.route('ai/<string:module>/trainModel/<string:model_name>', methods=['POST'])
@auth.token_required
def train_model(model_name, module):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'create_ai_model | create_ai_model_splitter']):
        return jsonify({
            'errors': gettext('UNAUTHORIZED_ROUTE'),
            'message': f'/ai/{module}/trainModel/{model_name}'
        }), 403

    data = json.loads(request.data)
    try:
        artificial_intelligence.launch_train(data, model_name, module)
    except Exception as e:
        print(str(e))
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
