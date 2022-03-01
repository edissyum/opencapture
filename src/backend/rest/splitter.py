# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json

from flask import Blueprint, make_response, jsonify, request
from flask_babel import gettext
from src.backend.import_controllers import auth
from src.backend.import_controllers import splitter

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@auth.token_required
def upload():
    input_id = None
    if 'inputId' in request.args:
        input_id = request.args['inputId']
    files = request.files
    res = splitter.handle_uploaded_file(files, input_id)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('splitter/batches', defaults={'time': None, 'status': None, 'batch_id': None, 'size': None, 'page': None},
          methods=['GET'])
@bp.route('splitter/batches/<int:batch_id>', defaults={'time': None, 'status': None, 'size': None, 'page': None},
          methods=['GET'])
@bp.route('splitter/batches/<int:page>/<int:size>/<string:time>/<string:status>', defaults={'batch_id': None},
          methods=['GET'])
@auth.token_required
def retrieve_splitter_batches(batch_id, page, size, time, status):
    args = {
        'batch_id': batch_id,
        'size': size,
        'page': page,
        'time': time if time != 'None' else None,
        'status': status
    }
    res = splitter.retrieve_batches(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/metadata', methods=['GET'])
@auth.token_required
def retrieve_splitter_metadata():
    res = splitter.retrieve_metadata()
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
    args = {
        'batch_id': data['batchId'],
        'split_index': data['splitIndex']
    }
    res = splitter.create_document(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/saveInfo', methods=['POST'])
@auth.token_required
def save_info():
    data = request.data
    data = json.loads(data)
    response, status = splitter.save_infos({
        'documents': data['documents'],
        'batch_id': data['batchId'],
        'movedPages': data['movedPages'],
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
    response, status = splitter.validate(data['documents'], data['batchMetadata'])
    return make_response(jsonify(response)), status


@bp.route('splitter/methods', methods=['GET'])
@auth.token_required
def get_split_methods():
    split_methods, status = splitter.get_split_methods()
    response = {
        'split_methods': split_methods
    }
    return make_response(jsonify(response)), status


@bp.route('splitter/merge/<int:parent_id>', methods=['POST'])
@auth.token_required
def merge_batches(parent_id):
    data = json.loads(request.data)['batches']
    splitter.merge_batches(parent_id, data)
    return make_response(jsonify('')), 200


@bp.route('splitter/invoices/totals', defaults={'status': None}, methods=['GET'])
@bp.route('splitter/invoices/totals/<string:status>', methods=['GET'])
@auth.token_required
def get_totals(status):
    totals = splitter.get_totals(status)
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('splitter/cmis/testConnection', methods=['POST'])
@auth.token_required
def test_connection():
    data = request.data
    data = json.loads(data)
    response, status = splitter.test_cmis_connection(data['args'])
    return make_response(jsonify(response)), status
