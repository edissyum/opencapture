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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import json
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.import_controllers import mailcollect, auth
from flask import Blueprint, jsonify, make_response, request

bp = Blueprint('mailcollect', __name__,  url_prefix='/ws/')


@bp.route('mailcollect/getProcesses', methods=['GET'])
@auth.token_required
def retrieve_processes():
    args = {
        'select': ['*'],
    }

    res = mailcollect.retrieve_processes(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/retrieveFolders', methods=['POST'])
@auth.token_required
def retrieve_folders():
    args = request.json
    res = mailcollect.retrieve_folders(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('mailcollect/updateProcess/<string:process_name>', methods=['POST'])
@auth.token_required
def update_process(process_name):
    data = request.json
    args = {
        'set': data,
        'process_name': process_name
    }
    res = mailcollect.update_process(args)
    return make_response(jsonify(res[0])), res[1]
