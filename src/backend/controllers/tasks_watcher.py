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

from gettext import gettext
from src.backend.import_models import tasks_watcher


def get_last_tasks(module):
    tasks = tasks_watcher.get_last_tasks(module)
    response = {
        "tasks": tasks
    }
    return response, 200


def create_task(args):
    res = tasks_watcher.create_task(args)
    if not res:
        response = {
            "errors": gettext('CREATE_TASK_ERROR'),
            "message": ''
        }
        return response, 400

    return '', 200
