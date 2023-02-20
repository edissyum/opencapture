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

from src.backend.import_controllers import auth, monitoring
from flask import Blueprint, make_response, jsonify

bp = Blueprint('monitoring', __name__, url_prefix='/ws/')


@bp.route('monitoring/list', methods=['GET'])
@auth.token_required
def get_processes():
    processes = monitoring.get_processes()
    return make_response(jsonify(processes[0])), processes[1]


@bp.route('monitoring/getProcessById/<int:process_id>', methods=['GET'])
@auth.token_required
def get_process_by_id(process_id):
    process = monitoring.get_process_by_id(process_id)
    return make_response(jsonify(process[0])), process[1]
