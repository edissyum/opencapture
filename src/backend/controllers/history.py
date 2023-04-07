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

from flask_babel import gettext
from src.backend.import_models import history
from flask import g as current_context, request
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def add_history(args):
    res, error = history.add_history(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext("ADD_HISTORY_ERROR"),
            "message": gettext(error)
        }
        return response, 400


def get_history(request_args):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    if configurations['locale'] == 'fra':
        _format = 'DD/MM/YYYY HH24:MI:SS'
    else:
        _format = 'MM/DD/YYYY HH24:MI:SS'

    args = {
        'select': ['*', 'count(*) OVER() as total', "to_char(history_date, '" + _format + "') as date"],
        'offset': request_args['offset'] if 'offset' in request_args else 0,
        'limit': request_args['limit'] if 'limit' in request_args else 'ALL',
        'order_by': ['id DESC']
    }
    where = []
    data = []
    if 'user' in request_args and request_args['user']:
        where.append('user_id = %s')
        data.append(request_args['user'])
    if 'submodule' in request_args and request_args['submodule']:
        where.append('history_submodule = %s')
        data.append(request_args['submodule'])
    if 'module' in request_args and request_args['module']:
        where.append('history_module = %s')
        data.append(request_args['module'])
    if 'year' in request_args and request_args['year']:
        where.append('extract(year from history_date) = %s')
        data.append(request_args['year'])

    if where:
        args.update({'where': where, 'data': data})

    _history, _ = history.get_history(args)
    response = {
        "history": _history
    }
    return response, 200


def get_history_submodules(submodule):
    args = {
        'select': ['DISTINCT(history_submodule)'],
    }

    if 'module' in submodule and submodule['module']:
        args.update({'where': ['history_module = %s'], 'data': [submodule['module']]})

    _history, _ = history.get_history(args)
    response = {
        "history": _history
    }
    return response, 200


def get_history_users():
    args = {
        'select': ['DISTINCT(user_id)'],
    }

    _history, _ = history.get_history(args)
    response = {
        "history": _history
    }
    return response, 200
