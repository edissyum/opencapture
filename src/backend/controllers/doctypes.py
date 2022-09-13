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
from flask_babel import gettext
from flask import request, session
from src.backend.import_models import doctypes
from src.backend.import_classes import _SeparatorQR
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def add_doctype(args):
    res, error = doctypes.add_doctype(args)
    if res:
        if args['is_default']:
            res, error = doctypes.set_default(args)
            if not res:
                response = {
                    "errors": gettext("SET_DEFAULT_DOCTYPE_ERROR"),
                    "message": error
                }
                return response, 401
    else:
        response = {
            "errors": gettext("ADD_DOCTYPE_ERROR"),
            "message": error
        }
        return response, 401
    response = {
        "id": res
    }
    return response, 200


def retrieve_doctypes(args):
    _doctypes, error = doctypes.retrieve_doctypes(args)

    if error is None:
        response = {
            "doctypes": _doctypes
        }
        return response, 200

    response = {
        "errors": gettext("DOCTYPE_ERROR"),
        "message": error
    }
    return response, 401


def update(args):
    doctype_old_data, _ = doctypes.retrieve_doctypes({
        'where': ['key = %s', 'form_id = %s', 'status <> %s'],
        'data': [args['key'], args['form_id'], 'DEL']
    })
    if doctype_old_data:
        if args['is_default']:
            res, error = doctypes.set_default(args)
            if not res:
                response = {
                    "message": gettext("SET_DEFAULT_DOCTYPE_ERROR"),
                    "errors": error
                }
                return response, 401
        doctype_childs, _ = doctypes.retrieve_doctypes({
            'where': ['status <> %s', 'form_id = %s', 'code like %s'],
            'data': ['DEL', args['form_id'], '{}.%'.format(doctype_old_data[0]['code'])]
        })
        for doctype_child in doctype_childs:
            res, error = doctypes.update({
                'key': doctype_child['key'],
                'code': doctype_child['code'].replace(doctype_old_data[0]['code'], args['code'])
                if args['status'] != 'DEL' else doctype_child['code'],
                'label': doctype_child['label'],
                'is_default': doctype_child['is_default'],
                'status': args['status'],
                'form_id': args['form_id'],
            })
            if not res:
                response = {
                    "message": gettext("DOCTYPE_ERROR"),
                    "errors": error
                }
                return response, 401

    res, error = doctypes.update(args)
    if res:
        response = {
            "res": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": error
        }
        return response, 401


def generate_separator(args):
    if 'docservers' in session and 'configurations' in session:
        docservers = json.loads(session['docservers'])
        configurations = json.loads(session['configurations'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    qr_code_value = ""
    separator_type_label = ""
    if args['type'] == "docTypeSeparator":
        qr_code_value = f"DOCSTART|{args['key']}"
        separator_type_label = gettext('DOCTYPESEPARATOR')
    elif args['type'] == "documentSeparator":
        qr_code_value = "DOCSTART"
        separator_type_label = gettext('DOCUMENTSEPARATOR')
    elif args['type'] == "bundleSeparator":
        qr_code_value = "BUNDLESTART"
        separator_type_label = gettext('BUNDLESEPARATOR')

    res_separators = _SeparatorQR.generate_separator(configurations, docservers, qr_code_value, args['label'],
                                                     separator_type_label)
    if not res_separators[0]:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": res_separators[1]
        }
        return response, 401

    response = {
        'encoded_file': res_separators[0],
        'encoded_thumbnail': res_separators[1]
    }
    return response, 200


def clone_form_doctypes(src_form_id, dest_form_id):
    args = {
        'where': ['form_id = %s', 'status <> %s'],
        'data': [src_form_id, 'DEL']
    }
    src_form_doctypes, error = doctypes.retrieve_doctypes(args)
    args = {
        'select': ["SPLIT_PART(code, '.', 2)::INTEGER AS index"],
        'where': ['form_id = %s'],
        'data': [src_form_id],
        'order_by': ["SPLIT_PART(code, '.', 2)::INTEGER DESC"],
        'limit': '1',
    }

    dest_last_code, error = doctypes.retrieve_doctypes(args)
    if error:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": error
        }
        return response, 500

    dest_last_code = dest_last_code[0]['index'] if 'index' in dest_last_code else 0
    for doctype in src_form_doctypes:
        indexes = doctype['code'].split('.')
        indexes[1] = str(int(doctype['code'].split('.')[1]) + dest_last_code + 1)
        args = {
            'code': '.'.join(indexes),
            'form_id': dest_form_id,
            'is_default': doctype['is_default'],
            'status': doctype['status'],
            'label': doctype['label'],
            'type': doctype['type'],
            'key': doctype['key'],
        }
        doctypes.add_doctype(args)

    return {'OK': True}, 200
