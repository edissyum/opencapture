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


from flask import request, session
from gettext import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_forms(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    forms = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'order_by': ['id ASC'],
        'offset': str(args['offset']) if 'offset' in args else 0,
    })

    return forms, error


def get_form_by_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    form = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['id = %s', 'status <> %s'],
        'data': [args['form_id'], 'DEL']
    })

    if not form:
        error = gettext('GET_FORM_BY_ID_ERROR')
    else:
        form = form[0]

    return form, error


def get_form_settings_by_module(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    form = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_model_settings'],
        'where': ['module = %s'],
        'data': [args['module']]
    })

    if not form:
        error = gettext('GET_FORM_SETTINGS_BY_ID_ERROR')
    else:
        form = form[0]

    return form, error


def get_default_form_by_module(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    form = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models'],
        'where': ['default_form = %s', 'status <> %s', 'module = %s'],
        'data': [True, 'DEL', args['module']]
    })

    if not form:
        error = gettext('GET_DEFAULT_FORM_ERROR')
    else:
        form = form[0]

    return form, error


def update_form(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    res = database.update({
        'table': ['form_models'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['form_id']]
    })

    if not res:
        error = gettext('UPDATE_FORM_ERROR')

    return res, error


def update_form_fields(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    res = database.update({
        'table': ['form_models_field'],
        'set': args['set'],
        'where': ['form_id = %s'],
        'data': [args['form_id']]
    })

    if not res:
        error = gettext('UPDATE_FORM_FIELDS_ERROR')

    return res, error


def add_form_fields(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    args = {
        'table': 'form_models_field',
        'columns': {
            'form_id': str(args),
        }
    }
    database.insert(args)
    return '', False


def add_form(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    forms_exists, error = get_forms({
        'where': ['label = %s', 'status <> %s', 'module = %s'],
        'data': [args['label'], 'DEL', args['module']]
    })

    if not forms_exists:
        if 'outputs' in args and args['outputs']:
            outputs = '{'
            for output in args['outputs']:
                outputs += output + ','
            outputs = outputs.rstrip(',')
            outputs += '}'
        else:
            outputs = {}
        args = {
            'table': 'form_models',
            'columns': {
                'outputs': outputs,
                'label': args['label'],
                'module': args['module'],
                'default_form': args['default_form'],
                'settings': args['settings'],
            }
        }
        res = database.insert(args)

        if not res:
            error = gettext('ADD_FORM_ERROR')
        return res, error
    else:
        error = gettext('FORM_LABEL_ALREADY_EXIST')

    return '', error


def get_fields(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    form_fields = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['form_models_field'],
        'where': ['form_id = %s'],
        'data': [args['form_id']]
    })

    if form_fields:
        form_fields = form_fields[0]

    return form_fields, error
