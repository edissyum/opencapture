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

# @dev : Oussama Brich <oussaba.brich@edissyum.com>

from src.backend.import_controllers import tasks_watcher
from flask import Blueprint, make_response, jsonify


bp = Blueprint('task_watcher', __name__, url_prefix='/ws/')


@bp.route('tasks/progress', methods=['GET'])
def get_last_task():
    tasks = tasks_watcher.get_last_tasks()
    return make_response(jsonify(tasks[0])), tasks[1]
