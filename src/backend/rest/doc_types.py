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
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth
from src.backend.import_controllers import doc_types

bp = Blueprint('docTypes', __name__, url_prefix='/ws/')


@bp.route('docTypes/list', defaults={'type': None}, methods=['GET'])
@bp.route('docTypes/list/<string:type>', methods=['GET'])
@auth.token_required
def retrieve_doc_types(type):
    if type:
        args = {
            'where': ['type = %s'],
            'data': [type]
        }
    else:
        args = {}
    res = doc_types.retrieve_doc_types(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('docTypes/add', methods=['POST'])
@auth.token_required
def add_doc_type():
    data = json.loads(request.data)
    res = doc_types.add_doc_type(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('docTypes/edit', methods=['POST'])
@auth.token_required
def update_doc_type():
    data = json.loads(request.data)
    res = doc_types.update(data)
    return make_response(jsonify(res[0])), res[1]
