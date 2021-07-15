# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask_babel import gettext
from ..import_models import forms, accounts
from ..import_controllers import pdf


def get_forms(args):
    _forms, error = forms.get_forms(args)

    if error is None:
        response = {
            "forms": _forms
        }
        return response, 200

    response = {
        "errors": "FORMS_ERROR",
        "message": error
    }
    return response, 401


def add_form(args):
    res, error = forms.add_form(args)
    if res:
        response = {
            "id": res
        }
        forms.add_form_fields(res)
        return response, 200
    else:
        response = {
            "errors": "FORMS_ERROR",
            "message": error
        }
        return response, 401


def get_form_by_id(form_id):
    form_info, error = forms.get_form_by_id({
        'form_id': form_id
    })

    if error is None:
        return form_info, 200
    else:
        response = {
            "errors": gettext('GET_FORM_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def get_form_by_supplier_id(supplier_id):
    form_id, error = accounts.get_supplier_by_id({'select': ['form_id'], 'supplier_id': supplier_id})
    if error is None:
        form_info, error = forms.get_fields({
            'form_id': form_id['form_id']
        })

        if error is None:
            return form_info, 200
        else:
            response = {
                "errors": gettext('GET_FORM_BY_SUPPLIER_ID_ERROR'),
                "message": error
            }
            return response, 401


def get_default_form():
    form_id, error = forms.get_default_form({'select': ['id']})
    if error is None:
        form_info, error = forms.get_fields({
            'form_id': form_id['id']
        })

        if error is None:
            return form_info, 200
        else:
            response = {
                "errors": gettext('GET_FORM_BY_SUPPLIER_ID_ERROR'),
                "message": error
            }
            return response, 401


def update_form(form_id, args):
    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.update_form({'set': args, 'form_id': form_id})
        if res:
            response = {
                "res": res
            }
            return response, 200
        else:
            response = {
                "errors": "FORMS_ERROR",
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": "FORMS_ERROR",
            "message": error
        }
    return response, 401


def delete_form(form_id):
    _vars = pdf.init()
    _db = _vars[0]

    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.update_form({'set': {'status': 'DEL', 'enabled': False}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_FORM_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_FORM_ERROR'),
            "message": error
        }
        return response, 401


def disable_form(form_id):
    _vars = pdf.init()
    _db = _vars[0]

    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.update_form({'set': {'enabled': False}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_FORM_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_FORM_ERROR'),
            "message": error
        }
        return response, 401


def enable_form(form_id):
    _vars = pdf.init()
    _db = _vars[0]

    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.update_form({'set': {'enabled': True}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_FORM_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('ENABLE_FORM_ERROR'),
            "message": error
        }
        return response, 401


def get_fields(form_id):
    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.get_fields({'form_id': form_id})
        response = {
            "form_fields": res
        }
        return response, 200
    else:
        response = {
            "errors": "GET_FORMS_FIELDS_ERROR",
            "message": error
        }
    return response, 401


def update_fields(args):
    _vars = pdf.init()
    _db = _vars[0]

    form_info, error = forms.get_form_by_id({'form_id': args['form_id']})
    if error is None:
        res, error = forms.update_form_fields({'set': {'fields': json.dumps(args['data'])}, 'form_id': args['form_id']})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_FORMS_FIELDS_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_FORMS_FIELDS_ERROR'),
            "message": error
        }
        return response, 401
