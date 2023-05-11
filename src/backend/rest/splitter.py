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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask_babel import gettext
from flask import Blueprint, make_response, jsonify, request
from src.backend.import_controllers import auth, splitter, forms, privileges

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@auth.token_required
def upload():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter', 'upload']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/upload'}), 403

    workflow_id = None
    if 'workflowId' in request.form:
        workflow_id = request.form['workflowId']

    user_id = None
    if 'userId' in request.form:
        user_id = request.form['userId']

    files = request.files
    res = splitter.handle_uploaded_file(files, workflow_id, user_id)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('splitter/batches/list', methods=['POST'])
@auth.token_required
def retrieve_splitter_batches():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/batches/list'}), 403

    res = splitter.retrieve_batches(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/batch/<int:batch_id>/file', methods=['GET'])
@auth.token_required
def download_original_file(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/batch/{batch_id}/file'}), 403

    response, status = splitter.download_original_file(batch_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/loadReferential/<int:form_id>', methods=['GET'])
@auth.token_required
def retrieve_referential(form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/loadReferential/{form_id}'}), 403

    res = splitter.retrieve_referential(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/status', methods=['PUT'])
@auth.token_required
def update_status():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter | update_status_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/status'}), 403

    data = json.loads(request.data)
    args = {
        'ids': data['ids'],
        'status': data['status']
    }
    res = splitter.update_status(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/documents/<int:batch_id>', methods=['GET'])
@auth.token_required
def retrieve_batch_documents(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/documents/{batch_id}'}), 403

    res = splitter.retrieve_documents(batch_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/addDocument', methods=['POST'])
@auth.token_required
def create_document():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/addDocument'}), 403

    data = json.loads(request.data)
    res = splitter.create_document(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/changeForm', methods=['POST'])
@auth.token_required
def change_form():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/changeForm'}), 403

    data = json.loads(request.data)
    response, status = splitter.change_form({
        'form_id': data['formId'],
        'batch_id': data['batchId'],
    })
    return make_response(jsonify(response)), status


@bp.route('splitter/lockBatch', methods=['POST'])
@auth.token_required
def lock_batch():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/lockBatch'}), 403

    data = json.loads(request.data)
    response, status = splitter.lock_batch({'batch_id': data['batchId'], 'user_id': data['lockedBy']})
    return make_response(jsonify(response)), status


@bp.route('splitter/removeLockByUserId/<string:user_id>', methods=['PUT'])
@auth.token_required
def remove_lock_by_user_id(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/removeLockByUserId/{user_id}'}), 403

    res = splitter.remove_lock_by_user_id(user_id)
    return make_response(res[0], res[1])


@bp.route('splitter/pages/<int:page_id>/fullThumbnail', methods=['GET'])
@auth.token_required
def get_page_full_thumbnail(page_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/pages/{page_id}/fullThumbnail'}), 403

    response, status = splitter.get_page_full_thumbnail(page_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/saveInfo', methods=['POST'])
@auth.token_required
def save_info():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/saveInfo'}), 403

    data = json.loads(request.data)
    response, status = splitter.save_infos(data)
    return make_response(jsonify(response)), status


@bp.route('splitter/validate', methods=['POST'])
@auth.token_required
def validate():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/validate'}), 403

    data = json.loads(request.data)
    response, status = splitter.validate(data)
    return make_response(jsonify(response)), status


@bp.route('splitter/splitMethods', methods=['GET'])
@auth.token_required
def get_split_methods():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_workflow_splitter | update_workflow_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/lockBatch'}), 403

    split_methods, status = splitter.get_split_methods()
    response = {
        'splitMethods': split_methods
    }
    return make_response(jsonify(response)), status


@bp.route('splitter/metadataMethods', methods=['GET'])
@bp.route('splitter/metadataMethods/<int:form_id>', methods=['GET'])
@auth.token_required
def get_metadata_methods(form_id=False):
    if not form_id:
        if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_form_splitter']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/metadataMethods'}), 403
    else:
        if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/splitter/metadataMethods/{form_id}'}), 403

    if form_id:
        form_infos = forms.get_form_by_id(form_id)
        split_methods, status = splitter.get_metadata_methods(form_infos[0]['settings']['metadata_method'])
    else:
        split_methods, status = splitter.get_metadata_methods()
    response = {
        'metadataMethods': split_methods
    }
    return make_response(jsonify(response)), status


@bp.route('splitter/merge/<int:parent_id>', methods=['POST'])
@auth.token_required
def merge_batches(parent_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/merge/{parent_id}'}), 403

    data = json.loads(request.data)['batches']
    splitter.merge_batches(parent_id, data)
    return make_response(jsonify('')), 200


@bp.route('splitter/batches/user/<int:user_id>/totals', defaults={'status': None}, methods=['GET'])
@bp.route('splitter/batches/user/<int:user_id>/totals/<string:status>', methods=['GET'])
@auth.token_required
def get_totals(status, user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/batches/user/{user_id}/totals/{status}'}), 403

    totals = splitter.get_totals(status, user_id)
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('splitter/cmis/testConnection', methods=['POST'])
@auth.token_required
def test_cmis_connection():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_output_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/cmis/testConnection'}), 403

    data = json.loads(request.data)
    response, status = splitter.test_cmis_connection(data['args'])
    return make_response(jsonify(response)), status


@bp.route('splitter/getUnseen/user/<int:user_id>', methods=['GET'])
@auth.token_required
def splitter_get_unseen(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/getUnseen/user/{user_id}'}), 403

    res = splitter.get_unseen(user_id)
    return make_response({'unseen': res[0]}, res[1])


@bp.route('splitter/openads/testConnection', methods=['POST'])
@auth.token_required
def test_openads_connection():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_output_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/openads/testConnection'}), 403

    data = json.loads(request.data)
    response, status = splitter.test_openads_connection(data['args'])
    return make_response(jsonify(response)), status
