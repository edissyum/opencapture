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


from flask import request
from flask_babel import gettext
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
                    "errors": "SET_DEFAULT_DOCTYPE_ERROR",
                    "message": error
                }
                return response, 401
    else:
        response = {
            "errors": "ADD_DOCTYPE_ERROR",
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
        "errors": "DOCTYPE_ERROR",
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
                    "errors": error,
                    "message": "SET_DEFAULT_DOCTYPE_ERROR"
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
                    "errors": error,
                    "message": "DOCTYPE_ERROR"
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
            "errors": "DOCTYPE_ERROR",
            "message": error
        }
        return response, 401


def generate_separator(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    _cfg = _vars[1]
    docservers = _vars[9]
    _db_config = {}

    _config = database.select({
        'select': ['*'],
        'table': ['configurations'],
    })

    for _c in _config:
        _db_config[_c['label']] = _c['data']['value']

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

    res_separators = _SeparatorQR.generate_separator(_db_config, _docservers, qr_code_value, args['label'], separator_type_label)
    if not res_separators[0]:
        response = {
            "errors": "DOCTYPE_ERROR",
            "message": res_separators[1]
        }
        return response, 401

    response = {
        'encoded_file': res_separators[0],
        'encoded_thumbnail': res_separators[1]
    }
    return response, 200
