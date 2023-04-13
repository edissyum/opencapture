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

import json
from flask_babel import gettext
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, workflow, privileges

bp = Blueprint('workflow', __name__, url_prefix='/ws/')


@bp.route('workflow/<string:module>/verifyInputFolder', methods=['POST'])
@auth.token_required
def verify_input_folder(module):
    list_priv = ['settings', 'add_workflow | update_workflow'] if module == 'verifier' else ['add_workflow_splitter | update_workflow_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/workflow/{module}/verifyInputFolder'}), 403

    data = json.loads(request.data)
    res = workflow.verify_input_folder(data)
    return make_response(jsonify(res[0])), res[1]
