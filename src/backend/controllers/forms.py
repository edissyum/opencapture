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

import json
from flask_babel import gettext
from src.backend.import_controllers import user
from src.backend.import_models import forms, accounts, verifier
from src.backend.main import create_classes_from_current_config


def get_forms(args):
    _forms, error = forms.get_forms(args)

    if error is None:
        if 'totals' in args and args['totals']:
            for form in _forms:
                allowed_customers, _ = user.get_customers_by_user_id(args['user_id'])
                allowed_customers.append(0)  # Update allowed customers to add Unspecified customers
                total = verifier.get_totals({'time': args['time'], 'status': args['status'], 'form_id': form['id'],'allowedCustomers': allowed_customers})[0]
                form['total'] = total
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


def get_form_fields_by_supplier_id(supplier_id):
    form_id, error = accounts.get_supplier_by_id({'select': ['form_id'], 'supplier_id': supplier_id})
    if error is None and form_id['form_id'] is not None:
        form_info, error = forms.get_fields({
            'form_id': form_id['form_id'],
            'module': 'verifier'
        })

        if error is None:
            return form_info, 200
        else:
            form_info = get_default_form()
            return form_info[0], form_info[1]
    else:
        return get_default_form()


def get_form_fields_by_form_id(form_id):
    form_info, error = forms.get_fields({
        'form_id': form_id
    })

    if error is None:
        return form_info, 200
    else:
        response = {
            "errors": gettext('GET_FORM_FIELDS_BY_FORM_ID_ERROR'),
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
                "errors": gettext('GET_FORM_BY_ID_ERROR'),
                "message": error
            }
            return response, 401


def update_form(form_id, args):
    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        # Remove previous default form is the updated one is set to default
        if 'default_form' in args and args['default_form'] is True:
            default_form, error = forms.get_default_form({})
            if not error and default_form['id'] != form_id:
                forms.update_form({'set': {'default_form': False}, 'form_id': default_form['id']})

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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'status': 'DEL', 'enabled': False}, 'form_id': form_id})
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


def duplicate_form(form_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        new_label = gettext('COPY_OF') + ' ' + form_info['label']
        args = {
            'label': new_label,
            'default_form': False,
            'outputs': form_info['outputs'],
            'module': form_info['module'],
            'supplier_verif': form_info['supplier_verif']
        }
        res, error = forms.add_form(args)
        if error is None:
            fields, error = get_fields(form_info['id'])
            if error == 200:
                forms.add_form_fields(res)
                update_fields({'data': fields['form_fields']['fields'], 'form_id': res})
                return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_FORM_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DUPLICATE_FORM_ERROR'),
            "message": error
        }
        return response, 401


def disable_form(form_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'enabled': False}, 'form_id': form_id})
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'enabled': True}, 'form_id': form_id})
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
    _, error = forms.get_form_by_id({'form_id': form_id})
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _, error = forms.get_form_by_id({'form_id': args['form_id']})
    if error is None:
        _, error = forms.update_form_fields({'set': {'fields': json.dumps(args['data'])}, 'form_id': args['form_id']})
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


def delete_custom_field_from_forms(args):
    _forms, error = forms.get_forms({'where': ['status <> %s'], 'data': ['DEL']})
    if not error:
        for form in _forms:
            fields = forms.get_fields({'form_id': form['id']})
            for tmp_field in fields[0]['fields']:
                cpt = 0
                for field in fields[0]['fields'][tmp_field]:
                    if field['unit'] == 'custom':
                        custom_id = field['id'].split('_')[1]
                        if int(custom_id) == int(args['custom_field_id']):
                            del fields[0]['fields'][tmp_field][cpt]
                    cpt += 1
            forms.update_form_fields({'set': {'fields': json.dumps(fields[0]['fields'])}, 'form_id': form['id']})
    return '', 200


def update_custom_field_from_forms(args):
    _forms, error = forms.get_forms({'where': ['status <> %s'], 'data': ['DEL']})
    if not error:
        for form in _forms:
            fields = forms.get_fields({'form_id': form['id']})
            for tmp_field in fields[0]['fields']:
                cpt = 0
                for field in fields[0]['fields'][tmp_field]:
                    if field['unit'] == 'custom':
                        custom_id = field['id'].split('_')[1]
                        if int(custom_id) == int(args['id']):
                            fields[0]['fields'][tmp_field][cpt]['type'] = args['type']
                            fields[0]['fields'][tmp_field][cpt]['format'] = args['type']
                            fields[0]['fields'][tmp_field][cpt]['label'] = args['label']
                            fields[0]['fields'][tmp_field][cpt]['module'] = args['module']
                            fields[0]['fields'][tmp_field][cpt]['enabled'] = args['enabled']
                    cpt += 1
            forms.update_form_fields({'set': {'fields': json.dumps(fields[0]['fields'])}, 'form_id': form['id']})
    return '', 200


def custom_present_in_form(args):
    custom_present = False
    _forms, error = forms.get_forms({'where': ['status <> %s'], 'data': ['DEL']})
    if not error:
        for form in _forms:
            fields = forms.get_fields({'form_id': form['id']})
            for tmp_field in fields[0]['fields']:
                for field in fields[0]['fields'][tmp_field]:
                    if field['unit'] == 'custom':
                        custom_id = field['id'].split('_')[1]
                        if int(custom_id) == int(args['custom_id']):
                            custom_present = True
    return custom_present, 200
