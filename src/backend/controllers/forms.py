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
from flask_babel import gettext

from ..models import forms
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
        return response, 200
    else:
        response = {
            "errors": "FORMS_ERROR",
            "message": error
        }
        return response, 401


def update_form(form_id, args):
    user_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        res, error = forms.update_form(args)
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

    user_info, error = forms.get_form_by_id({'form_id': form_id})
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

    user_info, error = forms.get_form_by_id({'form_id': form_id})
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

    user_info, error = forms.get_form_by_id({'form_id': form_id})
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
