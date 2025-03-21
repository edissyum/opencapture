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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask import request, g as current_context
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_positions_masks(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    positions_masks = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['positions_masks', 'form_models'],
        'left_join': ['positions_masks.form_id = form_models.id'],
        'where': ['1=1'] if 'where' not in args or not args['where'] else args['where'],
        'data': [] if 'data' not in args else args['data'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'order_by': args['order_by'] if 'order_by' in args else [],
        'offset': str(args['offset']) if 'offset' in args else 0
    })

    return positions_masks, error


def get_positions_mask_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    position_mask = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['positions_masks'],
        'where': ['id = %s', 'status <> %s'],
        'data': [args['position_mask_id'], 'DEL']
    })

    if not position_mask:
        error = gettext('GET_POSITIONS_MASKS_BY_ID_ERROR')
    else:
        position_mask = position_mask[0]

    return position_mask, error


def update_positions_mask(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    res = database.update({
        'table': ['positions_masks'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['position_mask_id']]
    })

    if not res:
        error = gettext('UPDATE_POSITIONS_MASKS_ERROR')

    return res, error


def update_poitions_mask_fields(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    res = database.update({
        'table': ['positions_masks_field'],
        'set': args['set'],
        'where': ['positions_mask_id = %s'],
        'data': [args['position_mask_id']]
    })

    if not res:
        error = gettext('UPDATE_POSITIONS_MASKS_FIELDS_ERROR')

    return res, error


def add_positions_mask(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    positions_masks_exists, error = get_positions_masks({
        'where': ['positions_masks.label = %s', 'positions_masks.status <> %s'],
        'data': [args['label'], 'DEL']
    })

    if not positions_masks_exists:
        args = {
            'table': 'positions_masks',
            'columns': {
                'label': args['label'],
                'form_id': args['form_id'],
                'supplier_id': args['supplier_id'],
                'pages': args['pages'] if 'pages' in args else {},
                'regex': args['regex'] if 'regex' in args else {},
                'width': args['width'] if 'width' in args else None,
                'nb_pages': args['nb_pages'] if 'nb_pages' in args else None,
                'filename': args['filename'] if 'filename' in args else None,
                'positions': args['positions'] if 'positions' in args else {}
            }
        }
        res = database.insert(args)

        if not res:
            error = gettext('ADD_POSITIONS_MASKS_ERROR')
        return res, error
    else:
        error = gettext('POSITIONS_MASK_LABEL_ALREADY_EXIST')

    return '', error
