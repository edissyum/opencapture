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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask import request, g as current_context
from gettext import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def add_custom_field(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    customs_exists, error = retrieve_custom_fields({
        'where': ['label_short = %s', 'module = %s', 'status <> %s'],
        'data': [args['label_short'], args['module'], 'DEL']
    })

    if not customs_exists:
        _args = {
            'table': 'custom_fields',
            'columns': {
                'type': args['type'],
                'label': args['label'],
                'module': args['module'],
                'label_short': args['label_short'],
                'metadata_key': args['metadata_key'],
                'settings': json.dumps({
                    'options': args['options'] if 'options' in args and args['options'] else None,
                    'regex': args['regex'] if 'regex' in args and args['regex'] else None
                })
            }
        }
        #
        # if 'options' in args and args['options']:
        #     _args['columns']['settings']['options'] = json.dumps(args['options'])

        # if 'regex' in args and args['regex']:
        #     _args['columns']['settings']['regex'] = args['regex']

        res = database.insert(_args)

        if not res:
            error = gettext('ADD_CUSTOM_FIELD_ERROR')
        return res, error
    else:
        error = gettext('CUSTOM_FIELD_ALREADY_EXIST')
    return '', error


def retrieve_custom_fields(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    custom_fields = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['custom_fields'],
        'where': ['status <> %s'] if 'where' not in args else args['where'],
        'data': ['DEL'] if 'data' not in args else args['data']
    })

    return custom_fields, error


def update(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    _args = {
        'table': ['custom_fields'],
        'set': {
            'label': args['label'],
            'type': args['type'],
            'module': args['module'],
            'enabled': args['enabled'],
            'label_short': args['label_short'],
            'metadata_key': args['metadata_key'],
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }
    if 'options' in args and args['options']:
        _args['set']['settings'] = json.dumps({'options': args['options']})

    res = database.update(_args)
    if not res:
        error = gettext('UPDATE_CUSTOM_FIELDS_ERROR')
    return res, error


def delete(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    res = database.update({
        'table': ['custom_fields'],
        'set': {
            'status': 'DEL'
        },
        'where': ['id = %s'],
        'data': [args['custom_field_id']]
    })

    if not res:
        error = gettext('DELETE_CUSTOM_FIELDS_ERROR')
    return res, error
