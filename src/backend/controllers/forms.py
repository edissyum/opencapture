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
from src.backend.import_controllers import user
from src.backend.import_models import forms, accounts, verifier


def get_forms(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'] if 'offset' in args else 0,
        'limit': args['limit'] if 'limit' in args else 'ALL',
        'where': ["status <> 'DEL'", "form_models.module like %s"],
        'data': [args['module']] if 'module' in args else '%',
        'totals': 'totals' in args and args['totals'] == 'true',
        'status': args['status'] if 'status' in args and args['status'] else 'NEW',
        'time': args['time'] if 'time' in args and args['status'] else 'today',
        'user_id': args['user_id'] if 'user_id' in args and args['user_id'] else None
    }

    if _args['user_id']:
        user_forms = user.get_forms_by_user_id(args['user_id'])
        if user_forms[1] != 200:
            return user_forms[0], user_forms[1]

        user_forms = user_forms[0]
        _args['where'].append('id = ANY(%s)')
        _args['data'].append(user_forms)

    _forms = forms.get_forms(_args)

    if 'totals' in args and args['totals']:
        for form in _forms:
            allowed_customers, _ = user.get_customers_by_user_id(args['user_id'])
            allowed_customers.append(0)  # Update allowed customers to add Unspecified customers
            total = verifier.get_totals({
                'time': args['time'],
                'status': args['status'],
                'form_id': form['id'],
                'allowedCustomers': allowed_customers
            })[0]
            form['total'] = total
    response = {
        "forms": _forms
    }

    return response, 200


def add_form(args):
    form_settings, error = forms.get_form_settings_by_module(args)
    if error:
        response = {
            "errors": gettext("FORMS_ERROR"),
            "message": gettext(error)
        }
        return response, 401

    if 'settings' in args:
        for key in args['settings']:
            form_settings['settings'][key] = args['settings'][key]
    args['settings'] = json.dumps(form_settings['settings'])

    form_id, error = forms.add_form(args)
    if form_id:
        if 'default_form' in args and args['default_form'] is True:
            default_form, error = forms.get_default_form_by_module({'module': args['module']})
            if not error and default_form['id'] != form_id:
                forms.update_form({
                    'set': {'default_form': False},
                    'form_id': default_form['id']
                })
        response = {
            "id": form_id
        }
        forms.add_form_fields(form_id)
        return response, 200
    else:
        response = {
            "errors": gettext("FORMS_ERROR"),
            "message": gettext(error)
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
            "message": gettext(error)
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
            form_info = get_default_form_by_module('verifier')
            return form_info[0], form_info[1]
    else:
        return get_default_form_by_module('verifier')


def get_form_fields_by_form_id(form_id):
    form_info, error = forms.get_fields({
        'form_id': form_id
    })

    if error is None:
        return form_info, 200
    else:
        response = {
            "errors": gettext('GET_FORM_FIELDS_BY_FORM_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_default_form_by_module(module):
    form_id, error = forms.get_default_form_by_module({'select': ['id'], 'module': module})
    if error is None:
        form_info, error = forms.get_fields({
            'form_id': form_id['id']
        })

        if error is None:
            return form_info, 200
        else:
            response = {
                "errors": gettext('GET_FORM_BY_ID_ERROR'),
                "message": gettext(error)
            }
            return response, 401


def update_form_label(form_id, category_id, label):
    form, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        labels = form['labels']
        labels[category_id] = label
        forms.update_form({'set': {'labels': json.dumps(labels)}, 'form_id': form_id})
    return '', 200


def update_form(form_id, args):
    form, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        # Remove previous default form is the updated one is set to default
        if 'default_form' in args and args['default_form'] is True:
            default_form, error = forms.get_default_form_by_module({'module': form['module']})
            if not error and default_form['id'] != form_id:
                forms.update_form({'set': {'default_form': False}, 'form_id': default_form['id']})

        # Update form settings
        for setting in args['settings']:
            try:
                if type(args['settings'][setting]) is bool:
                    forms.update_form({'set': {'settings': "jsonb_set(settings, '{" + setting + "}', '" + str(args['settings'][setting]).lower() + "')"}, 'form_id': form_id})
                elif args['settings'][setting] and type(args['settings'][setting]) is dict:
                    settings_data = json.dumps(args['settings'][setting]).replace("'", "''")
                    forms.update_form({'set': {'settings': "jsonb_set(settings, '{" + setting + "}', '" + settings_data + "')"}, 'form_id': form_id})
                else:
                    forms.update_form({'set': {'settings': "jsonb_set(settings, '{" + setting + "}', '\"" + str(args['settings'][setting]) + "\"')"}, 'form_id': form_id})
            except Exception:
                forms.update_form({'set': {'settings': "jsonb_set(settings, '{" + setting + "}', '\"" + str(args['settings'][setting]) + "\"')"}, 'form_id': form_id})

        # Update form other database columns
        del args['settings']
        if args:
            res, error = forms.update_form({'set': args, 'form_id': form_id})

        if error is None:
            return '', 200

        else:
            response = {
                "errors": gettext('UPDATE_FORMS_FIELDS_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext("FORMS_ERROR"),
            "message": gettext(error)
        }
    return response, 401


def delete_form(form_id):
    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'status': 'DEL', 'enabled': False}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_FORM_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_FORM_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def duplicate_form(form_id):
    form_info, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        new_label = gettext('COPY_OF') + ' ' + form_info['label']
        args = {
            'label': new_label,
            'default_form': False,
            'outputs': form_info['outputs'],
            'module': form_info['module'],
            'settings': json.dumps(form_info['settings'])
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
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DUPLICATE_FORM_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def disable_form(form_id):
    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'enabled': False}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_FORM_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_FORM_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def enable_form(form_id):
    _, error = forms.get_form_by_id({'form_id': form_id})
    if error is None:
        _, error = forms.update_form({'set': {'enabled': True}, 'form_id': form_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_FORM_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('ENABLE_FORM_ERROR'),
            "message": gettext(error)
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
            "errors": gettext("GET_FORMS_FIELDS_ERROR"),
            "message": gettext(error)
        }
    return response, 401


def update_fields(args):
    _, error = forms.get_form_by_id({'form_id': args['form_id']})
    if error is None:
        _, error = forms.update_form_fields({'set': {'fields': json.dumps(args['data'])}, 'form_id': args['form_id']})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_FORMS_FIELDS_ERROR'),
                "message": gettext(error)
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_FORMS_FIELDS_ERROR'),
            "message": gettext(error)
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
