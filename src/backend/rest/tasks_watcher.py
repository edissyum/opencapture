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

# @dev : Oussama Brich <oussaba.brich@edissyum.com>

from flask import Blueprint, make_response, jsonify, request
from src.backend.import_controllers import auth, tasks_watcher

bp = Blueprint('task_watcher', __name__, url_prefix='/ws/')


@bp.route('tasks/progress', methods=['GET'])
@auth.token_required
def get_last_task():
    tasks = tasks_watcher.get_last_tasks(request.args['module'])
    return make_response(jsonify(tasks[0])), tasks[1]
