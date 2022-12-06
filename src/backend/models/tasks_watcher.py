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

from flask import request
from gettext import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_last_tasks(module):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    tasks = database.select({
        'select': ['*', "to_char(creation_date, 'HH24:MI:SS') as begin_time",
                   "to_char(end_date, 'HH24:MI:SS') as end_time",
                   '(Extract(epoch FROM (CURRENT_TIMESTAMP - creation_date))/60)::INTEGER as age'],
        'table': ['tasks_watcher'],
        'where': ['module = %s', '(status IS NULL OR status = %s OR status = %s)', "creation_date > NOW() - INTERVAL %s"],
        'data': [module, 'done', 'error', '1 hour'],
        'order_by': ["id desc"],
    })

    return tasks


def create_task(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    res = database.insert({
        'table': 'tasks_watcher',
        'columns': {
            'title': args['title'],
            'type': args['type'],
            'module': args['module'],
        }
    })

    return res


def update_task(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    res = database.update({
        'table': ['tasks_watcher'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['task_id']]
    })

    if res[0] is False:
        error = gettext('UPDATE_TASK_ERROR')

    return res, error
