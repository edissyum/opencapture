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

from flask_babel import gettext
from ..controllers import forms
from ..models import custom_fields


def add_custom_field(args):
    res, error = custom_fields.add_custom_field(args)
    if res:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext("CUSTOM_FIELDS_ERROR"),
            "message": gettext(error)
        }
        return response, 400


def get_custom_field_by_id(custom_field_id):
    custom_field_info, error = custom_fields.get_custom_field_by_id({
        'custom_field_id': custom_field_id
    })

    if error is None:
        return custom_field_info, 200
    else:
        response = {
            "errors": gettext('GET_CUSTOM_FIELD_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400

def retrieve_custom_fields(args):
    _args = {
        'where': ['status <> %s'],
        'data': ['DEL']
    }

    if 'module' in args:
        _args['where'].append('module = %s')
        _args['data'].append(args['module'])

    if 'type' in args:
        _args['where'].append('type = %s')
        _args['data'].append(args['type'])

    if 'search' in args and args['search']:
        _args['where'].append('(label ILIKE %s OR label_short ILIKE %s)')
        _args['data'].append('%' + args['search'] + '%')
        _args['data'].append('%' + args['search'] + '%')

    if 'filter' in args and args['filter']:
        _args['order_by'] = [f"{args['filter']} {args['order']}"]

    custom_fields_res, error = custom_fields.retrieve_custom_fields(_args)

    if error is None:
        response = {
            "customFields": custom_fields_res
        }
        return response, 200

    response = {
        "errors": gettext("CUSTOM_FIELDS_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def update(args):
    res, error = custom_fields.update(args)
    if res:
        forms.update_custom_field_from_forms(args)
        return '', 200
    else:
        response = {
            "errors": gettext("CUSTOM_FIELDS_ERROR"),
            "message": gettext(error)
        }
        return response, 400


def delete(args):
    _, error = custom_fields.delete(args)
    if not error:
        forms.delete_custom_field_from_forms(args)
        return '', 200
    else:
        response = {
            "errors": gettext("CUSTOM_FIELDS_DELETE_ERROR"),
            "message": gettext(error)
        }
        return response, 400
