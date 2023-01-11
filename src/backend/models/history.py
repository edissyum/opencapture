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

from flask import request, session
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def add_history(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    args = {
        'table': 'history',
        'columns': {
            'history_submodule': args['submodule'],
            'history_module': args['module'],
            'user_info': args['user_info'],
            'history_desc': args['desc'],
            'user_id': args['user_id'],
            'user_ip': args['ip'],
        }
    }
    database.insert(args)
    return True, ''


def get_history(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    _history = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['history'],
        'where': args['where'] if 'where' in args else [],
        'data': args['data'] if 'data' in args else [],
        'order_by': args['order_by'] if 'order_by' in args else [],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })
    return _history, error
