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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from gettext import gettext
from src.backend.main import create_classes_from_current_config


def get_positions_masks(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    positions_masks = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['positions_masks'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'order_by': args['order_by'] if 'order_by' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return positions_masks, error


def get_positions_mask_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    position_mask = _db.select({
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    res = _db.update({
        'table': ['positions_masks'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['position_mask_id']]
    })

    if not res:
        error = gettext('UPDATE_POSITIONS_MASKS_ERROR')

    return res, error


def update_poitions_mask_fields(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    res = _db.update({
        'table': ['positions_masks_field'],
        'set': args['set'],
        'where': ['positions_mask_id = %s'],
        'data': [args['position_mask_id']]
    })

    if not res:
        error = gettext('UPDATE_POSITIONS_MASKS_FIELDS_ERROR')

    return res, error


def add_positions_mask(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    positions_masks_exists, error = get_positions_masks({
        'where': ['label = %s', 'status <> %s'],
        'data': [args['label'], 'DEL']
    })

    if not positions_masks_exists:
        args = {
            'table': 'positions_masks',
            'columns': {
                'label': args['label'],
                'supplier_id': args['supplier_id'],
            }
        }
        res = _db.insert(args)

        if not res:
            error = gettext('ADD_POSITIONS_MASKS_ERROR')
        return res, error
    else:
        error = gettext('POSITIONS_MASK_LABEL_ALREADY_EXIST')

    return '', error
