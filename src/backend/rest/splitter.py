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
from src.backend.import_controllers import auth, splitter, forms

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@auth.token_required
def upload():
    input_id = None
    if 'inputId' in request.args:
        input_id = request.args['inputId']

    user_id = None
    if 'userId' in request.args:
        user_id = request.args['userId']

    files = request.files
    res = splitter.handle_uploaded_file(files, input_id, user_id)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('splitter/batches/list', methods=['POST'])
@auth.token_required
def retrieve_splitter_batches():
    data = request.json
    args = {
        'user_id': data['userId'],
        'size': data['size'] if 'size' in data else None,
        'page': data['page'] if 'page' in data else None,
        'time': data['time'] if 'time' in data else None,
        'status': data['status'] if 'status' in data else None,
        'batch_id': data['batchId'] if 'batchId' in data else None,
    }
    res = splitter.retrieve_batches(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/batch/<int:batch_id>/file', methods=['GET'])
@auth.token_required
def download_original_file(batch_id):
    response, status = splitter.download_original_file(batch_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/loadReferential/<int:form_id>', methods=['GET'])
@auth.token_required
def retrieve_referential(form_id):
    res = splitter.retrieve_referential(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/status', methods=['PUT'])
@auth.token_required
def change_batch_status():
    data = json.loads(request.data)

    args = {
        'id': str(data['id']),
        'status': data['status']
    }
    res = splitter.change_status(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/documents/<int:batch_id>', methods=['GET'])
@auth.token_required
def retrieve_batch_documents(batch_id):
    res = splitter.retrieve_documents(batch_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/addDocument', methods=['POST'])
@auth.token_required
def create_document():
    data = request.data
    data = json.loads(data)
    res = splitter.create_document(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/changeForm', methods=['POST'])
@auth.token_required
def change_form():
    data = request.data
    data = json.loads(data)
    response, status = splitter.change_form({
        'form_id': data['formId'],
        'batch_id': data['batchId'],
    })
    return make_response(jsonify(response)), status


@bp.route('splitter/lockBatch', methods=['POST'])
@auth.token_required
def lock_batch():
    data = request.data
    data = json.loads(data)
    response, status = splitter.lock_batch({'batch_id': data['batchId'], 'user_id': data['lockedBy']})
    return make_response(jsonify(response)), status


@bp.route('splitter/removeLockByUserId/<string:user_id>', methods=['PUT'])
@auth.token_required
def remove_lock_by_user_id(user_id):
    res = splitter.remove_lock_by_user_id(user_id)
    return make_response(res[0], res[1])


@bp.route('splitter/pages/<int:page_id>/fullThumbnail', methods=['GET'])
@auth.token_required
def get_page_full_thumbnail(page_id):
    response, status = splitter.get_page_full_thumbnail(page_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/saveInfo', methods=['POST'])
@auth.token_required
def save_info():
    data = request.data
    data = json.loads(data)
    response, status = splitter.save_infos({
        'documents': data['documents'],
        'batch_id': data['batchId'],
        'moved_pages': data['movedPages'],
        'batch_metadata': data['batchMetadata'],
        'deleted_pages_ids': data['deletedPagesIds'],
        'deleted_documents_ids': data['deletedDocumentsIds']
    })
    return make_response(jsonify(response)), status


@bp.route('splitter/validate', methods=['POST'])
@auth.token_required
def validate():
    data = request.data
    data = json.loads(data)
    response, status = splitter.validate(data)
    return make_response(jsonify(response)), status


@bp.route('splitter/splitMethods', methods=['GET'])
@auth.token_required
def get_split_methods():
    split_methods, status = splitter.get_split_methods()
    response = {
        'splitMethods': split_methods
    }
    return make_response(jsonify(response)), status


@bp.route('splitter/metadataMethods', methods=['GET'])
@bp.route('splitter/metadataMethods/<int:form_id>', methods=['GET'])
@auth.token_required
def get_metadata_methods(form_id=False):
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
    data = json.loads(request.data)['batches']
    splitter.merge_batches(parent_id, data)
    return make_response(jsonify('')), 200


@bp.route('splitter/batches/user/<int:user_id>/totals', defaults={'status': None}, methods=['GET'])
@bp.route('splitter/batches/user/<int:user_id>/totals/<string:status>', methods=['GET'])
@auth.token_required
def get_totals(status, user_id):
    totals = splitter.get_totals(status, user_id)
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('splitter/cmis/testConnection', methods=['POST'])
@auth.token_required
def test_cmis_connection():
    data = request.data
    data = json.loads(data)
    response, status = splitter.test_cmis_connection(data['args'])
    return make_response(jsonify(response)), status


@bp.route('splitter/openads/testConnection', methods=['POST'])
@auth.token_required
def test_openads_connection():
    data = request.data
    data = json.loads(data)
    response, status = splitter.test_openads_connection(data['args'])
    return make_response(jsonify(response)), status
