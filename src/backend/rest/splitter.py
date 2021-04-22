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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json

from flask import Blueprint, make_response, jsonify, request, current_app

from ..controllers.auth import token_required
from ..controllers.splitter import *

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@token_required
def upload():
    files = request.files

    if 'file' not in files:
        return make_response({'ok': False}, 500)
    upload_files(files)
    return make_response({'ok': True}, 200)


@bp.route('splitter/batches', methods=['GET'])
@token_required
def retrieve_splitter_batches():
    res = retrieve_batches()
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/status', methods=['PUT'])
@token_required
def change_batch_status():
    data = json.loads(request.data)

    args = {
        'id': str(data['id']),
        'status': data['status']
    }
    res = change_status(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/pages/<int:batch_id>', methods=['GET'])
@token_required
def retrieve_batch_pages(batch_id):
    res = retrieve_pages(batch_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/validate', methods=['POST'])
@token_required
def validate():
    data = request.data
    data = json.loads(data)
    print(data['documents'][0])
    return make_response(jsonify({})), 200
