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
from src.backend.models import positions_masks, history


def get_positions_masks(data):
    args = {
        'select': ['positions_masks.*', 'form_models.label as form_label', 'count(*) OVER() as total'],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL',
        'where': ["positions_masks.status <> 'DEL'"],
        'order_by': ['positions_masks.id ASC']
    }
    _positions_masks, error = positions_masks.get_positions_masks(args)
    if error is None:
        response = {
            "positions_masks": _positions_masks
        }
        return response, 200

    response = {
        "errors": gettext("POSITION_MASKS_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def add_positions_mask(args):
    res, error = positions_masks.add_positions_mask(args)
    if res:
        history.add_history({
            'module': 'verifier',
            'ip': request.remote_addr,
            'submodule': 'create_positions_mask',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_POSITIONS_MASK', mask=args['label'])
        })

        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext("POSITION_MASKS_ERROR"),
            "message": gettext(error)
        }
        return response, 400


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
        return response, 400


def update_positions_mask(position_mask_id, args):
    _, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        res, error = positions_masks.update_positions_mask({'set': args, 'position_mask_id': position_mask_id})

        if res:
            response = {
                "res": res
            }

            if 'label' in args and args['label']:
                history.add_history({
                    'module': 'verifier',
                    'ip': request.remote_addr,
                    'submodule': 'update_positions_mask',
                    'user_info': request.environ['user_info'],
                    'desc': gettext('UPDATE_POSITIONS_MASK', mask=args['label'])
                })
            return response, 200
        else:
            response = {
                "errors": gettext("POSITION_MASKS_ERROR"),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext("POSITION_MASKS_ERROR"),
            "message": gettext(error)
        }
    return response, 400


def delete_positions_mask(position_mask_id):
    mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _, error = positions_masks.update_positions_mask({'set': {'status': 'DEL', 'enabled': False}, 'position_mask_id': position_mask_id})
        if error is None:
            history.add_history({
                'module': 'verifier',
                'ip': request.remote_addr,
                'submodule': 'delete_positions_mask',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_POSITIONS_MASK', mask=mask_info['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def duplicate_positions_mask(position_mask_id):
    positions_masks_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        new_label = gettext('COPY_OF') + ' ' + positions_masks_info['label']
        args = {
            'label': new_label,
            'width': positions_masks_info['width'],
            'form_id': positions_masks_info['form_id'],
            'nb_pages': positions_masks_info['nb_pages'],
            'filename': positions_masks_info['filename'],
            'supplier_id': positions_masks_info['supplier_id'],
            'pages': json.dumps(positions_masks_info['pages']),
            'regex': json.dumps(positions_masks_info['regex']),
            'positions': json.dumps(positions_masks_info['positions'])
        }
        _, error = positions_masks.add_positions_mask(args)
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_POSITIONS_MASKS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DUPLICATE_POSITIONS_MASKS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def disable_positions_mask(position_mask_id):
    mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _, error = positions_masks.update_positions_mask({'set': {'enabled': False}, 'position_mask_id': position_mask_id})
        if error is None:
            history.add_history({
                'module': 'verifier',
                'ip': request.remote_addr,
                'submodule': 'disable_positions_mask',
                'user_info': request.environ['user_info'],
                'desc': gettext('DISABLE_POSITIONS_MASK', mask=mask_info['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DISABLE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def enable_positions_mask(position_mask_id):
    mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _, error = positions_masks.update_positions_mask({'set': {'enabled': True}, 'position_mask_id': position_mask_id})
        if error is None:
            history.add_history({
                'module': 'verifier',
                'ip': request.remote_addr,
                'submodule': 'enable_positions_mask',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_POSITIONS_MASK', mask=mask_info['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_POSITION_MASK_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('ENABLE_POSITION_MASK_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_positions_by_positions_mask_id(position_mask_id, args):
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
        _, error = positions_masks.update_positions_mask({'set': {"positions": json.dumps(positions)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_POSITIONS_BY_POSITIONS_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_pages_by_positions_mask_id(position_mask_id, args):
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
        _, error = positions_masks.update_positions_mask({'set': {"pages": json.dumps(pages)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_PAGES_BY_POSITIONS_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_position_by_positions_mask_id(position_mask_id, field_id):
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _set = {}
        positions = positions_mask_info['positions']
        if field_id in positions:
            del positions[field_id]
        _, error = positions_masks.update_positions_mask({'set': {"positions": json.dumps(positions)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_POSITIONS_BY_POSITION_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_page_by_positions_mask_id(position_mask_id, field_id):
    positions_mask_info, error = positions_masks.get_positions_mask_by_id({'position_mask_id': position_mask_id})
    if error is None:
        _set = {}
        pages = positions_mask_info['pages']
        if field_id in pages:
            del pages[field_id]
        _, error = positions_masks.update_positions_mask({'set': {"pages": json.dumps(pages)}, 'position_mask_id': position_mask_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_PAGES_BY_POSITION_MASK_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 400
