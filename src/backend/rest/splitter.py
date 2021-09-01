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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json

from flask import Blueprint, make_response, jsonify, request
from flask_babel import gettext
from ..import_controllers import auth
from ..import_controllers import splitter

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@auth.token_required
def upload():
    if request.method == 'POST':
        files = request.files
        res = splitter.handle_uploaded_file(files)
        if res:
            return make_response('', 200)
        else:
            return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('splitter/batches', methods=['GET'])
@auth.token_required
def retrieve_splitter_batches():
    res = splitter.retrieve_batches()
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


@bp.route('splitter/pages/<int:batch_id>', methods=['GET'])
@auth.token_required
def retrieve_batch_pages(batch_id):
    res = splitter.retrieve_pages(batch_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/validate', methods=['POST'])
@auth.token_required
def validate():
    data = request.data
    data = json.loads(data)
    return make_response(jsonify({})), 200
