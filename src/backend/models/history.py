# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import request, g as current_context
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def add_history(args):
    if 'database' in current_context:
        database = current_context.database
    else:
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
            'user_id': args['user_id'] if 'user_id' in args else None,
            'user_ip': args['ip']
        }
    }
    database.insert(args)
    return True, ''


def get_history(args):
    if 'database' in current_context:
        database = current_context.database
    else:
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
        'offset': str(args['offset']) if 'offset' in args else 0
    })
    return _history, error
