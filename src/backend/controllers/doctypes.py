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

import csv
import base64
import codecs
from io import StringIO

from flask_babel import gettext
from flask import request, g as current_context
from src.backend.import_models import doctypes
from src.backend.import_classes import _SeparatorQR, _Files
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
                    "message": gettext(error)
                }
                return response, 400
    else:
        response = {
            "errors": gettext("ADD_DOCTYPE_ERROR"),
            "message": gettext(error)
        }
        return response, 400
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
        "message": gettext(error)
    }
    return response, 400


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
                return response, 400
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
                'form_id': args['form_id']
            })
            if not res:
                response = {
                    "message": gettext("DOCTYPE_ERROR"),
                    "errors": error
                }
                return response, 400

    res, error = doctypes.update(args)
    if res:
        response = {
            "res": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": gettext(error)
        }
        return response, 400


def generate_separator(args):
    if 'docservers' in current_context and 'configurations' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    separators = []
    if args['type'] == "bundleSeparator":
        separators.append({
            "label": '',
            "qr_code_value": "BUNDLESTART",
            "type": gettext('BUNDLESEPARATOR')
        })

    elif args['type'] == "documentSeparator":
        separators.append({
            "label": '',
            "qr_code_value": "DOCSTART",
            "type": gettext('DOCUMENTSEPARATOR')
        })

    if args['type'] == "docTypeSeparator":
        _doctypes, error = doctypes.retrieve_doctypes({
            'where': ['id = %s'],
            'data': [args['id']]
        })
        doctype = _doctypes[0]

        if doctype['type'] == 'folder':
            _doctypes, error = doctypes.retrieve_doctypes({
                'where': ['status <> %s', 'form_id = %s', 'code like %s'],
                'data': ['DEL', doctype['form_id'], f"{doctype['code']}.%"]
            })

        for doctype in _doctypes:
            separators.append({
                "label": doctype['label'],
                "type": gettext('DOCTYPESEPARATOR'),
                "qr_code_value": f"DOCSTART|{doctype['key']}"
            })

    res_separators = _SeparatorQR.generate_separator(docservers, separators)
    if 'error' in res_separators:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": res_separators['error']
        }
        return response, 400

    response = {
        'total': res_separators['total'],
        'encoded_file': res_separators['encoded_file'],
        'encoded_thumbnails': res_separators['encoded_thumbnails']
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
        'limit': '1'
    }

    dest_last_code, error = doctypes.retrieve_doctypes(args)
    if error:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": gettext(error)
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


def export_doctypes_csv(args):
    delimiter = ','
    columns = []
    values = []

    if args['delimiter'] == 'TAB':
        delimiter = '\t'
    elif args['delimiter'] == 'SEMICOLON':
        delimiter = ';'

    _doctypes, error = doctypes.retrieve_doctypes({
        'where': ['form_id = %s', 'status <> %s'],
        'data': [args['formId'], 'DEL']
    })
    if error:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": gettext(error)
        }
        return response, 500

    try:
        csv_file = StringIO()
        csv_writer = csv.writer(csv_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)

        for column in args['columns']:
            columns.append(column['label'])
        csv_writer.writerow(columns)
        for doctype in _doctypes:
            for column in args['columns']:
                if column['id'] in doctype:
                    values.append(doctype[column['id']])

            csv_writer.writerow(values)
            values = []

        csv_file.seek(0)
        b64 = base64.b64encode(csv_file.getvalue().encode())
        response = {
            'encoded_csv': b64.decode()
        }
        return response, 200

    except Exception as e:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": str(e)
        }
        return response, 500

    return True, 200


def csv_preview(files):
    try:
        for file in files:
            rows = []
            _f = files[file]
            stream = codecs.iterdecode(_f.stream, 'utf-8')
            for cpt, row in enumerate(csv.reader(stream, dialect=csv.excel)):
                if row:
                    rows.append(row)
                if cpt > 10:
                    break
        response = {
            'rows': rows
        }
        return response, 200

    except Exception as e:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": str(e)
        }
        return response, 500
