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

# @dev : Tristan Coulange <tristan.coulange@free.fr>

from flask import request, g as current_context
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_models(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    models = database.select({
        'select': ["*"] if "select" not in args else args["select"],
        'table': ["ai_models"],
        'where': [] if "where" not in args else args["where"],
        'data': [] if "data" not in args else args["data"],
        'order_by': ["id ASC"],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
    })
    return models


def get_model_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    model = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['ai_models'],
        'where': ['id = %s'],
        'data': [args['model_id']]
    })

    if not model:
        error = gettext('IA_MODEL_DOESNT_EXISTS')
    else:
        model = model[0]
    return model, error


def create_model(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    model = database.insert({
        'table': 'ai_models',
        'columns': args['columns'],
    })

    if not model:
        error = gettext('IA_MODEL_CREATE_ERROR')
    return model, error


def update_models(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    models = database.update({
        'table': ['ai_models'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['model_id']]
    })

    if models[0] is False:
        error = gettext('IA_MODEL_UPDATE_ERROR')
    return models, error
