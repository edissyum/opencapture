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
from flask import request
from flask_babel import gettext
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url
from src.backend.import_models import positions_masks, accounts


def get_positions_masks(args):
    _positions_masks, error = positions_masks.get_positions_masks(args)
    total_positions_mask = positions_masks.get_positions_masks({
        'select': ['COUNT(*) as total'],
        'where': ['positions_masks.status = %s'],
        'data': ['OK']
    })
    if error is None:
        response = {
            "total": total_positions_mask[0][0]['total'],
            "positions_masks": _positions_masks
        }
        return response, 200

    response = {
        "errors": gettext("POSITION_MASKS_ERROR"),
        "message": gettext(error)
    }
    return response, 401


def add_positions_mask(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    _spreadsheet = _vars[7]
    res, error = positions_masks.add_positions_mask(args)
    if res:
        _spreadsheet.update_supplier_ods_sheet(_db)
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext("POSITION_MASKS_ERROR"),
            "message": gettext(error)
        }
        return response, 401


def get_positions_mask_by_id(position_mask_id):
    positions_masks_info, error = positions_masks.get_positions_mask_by_id({
        'position_mask_id': position_mask_id
    })

    if error is None:
        return positions_masks_info, 200
    else:
        response = {
            "errors": gettext('GET_POSITION_MASK_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_positions_mask_fields_by_supplier_id(supplier_id):
    position_mask_id, error = accounts.get_supplier_by_id({'select': ['position_mask_id'], 'supplier_id': supplier_id})
    if error is None:
        positions_masks_info, error = positions_masks.get_fields({
            'position_mask_id': position_mask_id['position_mask_id']
        })

        if error is None:
            return positions_masks_info, 200
        else:
            response = {
                "errors": gettext('GET_POSITION_MASK_BY_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401


def update_positions_mask(position_mask_id, args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    _spreadsheet = _vars[7]
    _, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        res, error = positions_masks.update_positions_mask({'set': args, 'position_mask_id': position_mask_id})

        if res:
            _spreadsheet.update_supplier_ods_sheet(_db)
            response = {
                "res": res
            }
            return response, 200
        else:
            response = {
                "errors": gettext("POSITION_MASKS_ERROR"),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext("POSITION_MASKS_ERROR"),
            "message": gettext(error)
        }
    return response, 401


def delete_positions_mask(position_mask_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]

    positions_masks_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        res, error = positions_masks.update_positions_mask({'set': {'status': 'DEL', 'enabled': False}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def duplicate_positions_mask(position_mask_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    positions_masks_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        new_label = gettext('COPY_OF') + ' ' + positions_masks_info['label']
        args = {
            'label': new_label,
            'supplier_id': positions_masks_info['supplier_id'],
            'pages': json.dumps(positions_masks_info['pages']),
            'regex': json.dumps(positions_masks_info['regex']),
            'width': positions_masks_info['width'],
            'nb_pages': positions_masks_info['nb_pages'],
            'filename': positions_masks_info['filename'],
            'positions': json.dumps(positions_masks_info['positions'])
        }
        res, error = positions_masks.add_positions_mask(args)
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_POSITIONS_MASKS_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DUPLICATE_POSITIONS_MASKS_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def disable_positions_mask(position_mask_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]

    positions_masks_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        res, error = positions_masks.update_positions_mask({'set': {'enabled': False}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def enable_positions_mask(position_mask_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]

    positions_masks_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        res, error = positions_masks.update_positions_mask({'set': {'enabled': True}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('ENABLE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def update_positions_by_positions_mask_id(position_mask_id, args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        column = position = ''
        for _position in args:
            column = _position
            position = args[_position]

        positions = positions_mask_info['positions']
        positions.update({
            column: position
        })
        res, error = positions_masks.update_positions_mask({'set': {"positions": json.dumps(positions)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_POSITIONS_BY_POSITIONS_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401


def update_pages_by_positions_mask_id(position_mask_id, args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        column = page = ''
        for _page in args:
            column = _page
            page = args[_page]

        pages = positions_mask_info['pages']
        pages.update({
            column: page
        })
        res, error = positions_masks.update_positions_mask({'set': {"pages": json.dumps(pages)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_PAGES_BY_POSITIONS_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401


def delete_position_by_positions_mask_id(position_mask_id, field_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _set = {}
        positions = positions_mask_info['positions']
        if field_id in positions:
            del(positions[field_id])
        res, error = positions_masks.update_positions_mask({'set': {"positions": json.dumps(positions)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_POSITIONS_BY_POSITION_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401


def delete_page_by_positions_mask_id(position_mask_id, field_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _db = _vars[0]
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _set = {}
        pages = positions_mask_info['pages']
        if field_id in pages:
            del(pages[field_id])
        res, error = positions_masks.update_positions_mask({'set': {"pages": json.dumps(pages)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_PAGES_BY_POSITION_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401
