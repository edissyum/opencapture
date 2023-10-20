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

from flask_babel import gettext
from src.backend.functions import rest_validator
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth, forms, privileges

bp = Blueprint('forms', __name__, url_prefix='/ws/')


@bp.route('forms/<string:module>/list', methods=['GET'])
@auth.token_required
def get_forms(module):
    if 'skip' not in request.environ or not request.environ['skip']:
        list_priv = ['settings | access_verifier', 'access_verifier | forms_list | users_list'] if module == 'verifier'\
            else ['users_list | access_splitter | forms_list_splitter | separator_splitter']
        if not privileges.has_privileges(request.environ['user_id'], list_priv):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'time', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'search', 'type': str, 'mandatory': False},
        {'id': 'status', 'type': str, 'mandatory': False},
        {'id': 'user_id', 'type': int, 'mandatory': False},
        {'id': 'totals', 'type': bool, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    args = dict(request.args)
    args['module'] = module
    res = forms.get_forms(args)
    return make_response(jsonify(res[0]), res[1])


@bp.route('forms/<string:module>/getById/<int:form_id>', methods=['GET'])
@auth.token_required
def get_form_by_id(form_id, module):
    if 'skip' not in request.environ or not request.environ['skip']:
        list_priv = ['access_verifier | update_form'] if module == 'verifier' else ['access_splitter | update_form_splitter']
        if not privileges.has_privileges(request.environ['user_id'], list_priv):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/forms/{module}/getById/{form_id}'}), 403

    _form = forms.get_form_by_id(form_id)
    return make_response(jsonify(_form[0])), _form[1]


@bp.route('forms/<string:module>/create', methods=['POST'])
@auth.token_required
def create_form(module):
    list_priv = ['settings', 'add_form'] if module == 'verifier' else ['settings', 'add_form_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/create'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'label', 'type': str, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'outputs', 'type': list, 'mandatory': True},
        {'id': 'settings', 'type': dict, 'mandatory': True},
        {'id': 'default_form', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.create_form(request.json['args'], module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/fields/getByFormId/<int:form_id>', methods=['GET'])
@auth.token_required
def get_form_fields_by_form_id(form_id):
    _form = forms.get_form_fields_by_form_id(form_id)
    return make_response(jsonify(_form[0])), _form[1]


@bp.route('forms/fields/getBySupplierId/<int:supplier_id>', methods=['GET'])
@auth.token_required
def get_form_by_account_id(supplier_id):
    _form = forms.get_form_fields_by_supplier_id(supplier_id)
    return make_response(jsonify(_form[0])), _form[1]


@bp.route('forms/getDefault/<string:module>', methods=['GET'])
@auth.token_required
def get_default_form(module):
    _form = forms.get_default_form_by_module(module)
    return make_response(jsonify(_form[0])), _form[1]


@bp.route('forms/<string:module>/update/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form(form_id, module):
    list_priv = ['settings', 'update_form'] if module == 'verifier' else ['settings', 'update_form_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/update/{form_id}'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'label', 'type': str, 'mandatory': False},
        {'id': 'outputs', 'type': list, 'mandatory': False},
        {'id': 'settings', 'type': dict, 'mandatory': False},
        {'id': 'default_form', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.update_form(form_id, request.json['args'], module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateLabel/<int:form_id>/<string:category_id>', methods=['PUT'])
@auth.token_required
def update_form_label(form_id, category_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_form']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/forms/updateLabel/{form_id}/{category_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'label', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.update_form_label(form_id, category_id, request.json['label'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateDisplay/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form_display(form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'verifier_settings']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/updateDisplay/{form_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'display', 'type': dict, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.update_form(form_id, {"settings": {"display": request.json['display']}}, 'verifier')
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateUniqueUrl/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form_unique_url(form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'verifier_settings']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/updateUniqueUrl/{form_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'unique_url', 'type': dict, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.update_form(form_id, {"settings": {"unique_url": request.json['unique_url']}}, 'verifier')
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/<string:module>/delete/<int:form_id>', methods=['DELETE'])
@auth.token_required
def delete_form(form_id, module):
    list_priv = ['settings', 'forms_list'] if module == 'verifier' else ['settings', 'forms_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/delete/{form_id}'}), 403

    res = forms.delete_form(form_id, module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/<string:module>/duplicate/<int:form_id>', methods=['POST'])
@auth.token_required
def duplicate_form(form_id, module):
    list_priv = ['settings', 'forms_list'] if module == 'verifier' else ['settings', 'forms_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/duplicate/{form_id}'}), 403

    res = forms.duplicate_form(form_id, module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/<string:module>/disable/<int:form_id>', methods=['PUT'])
@auth.token_required
def disable_form(form_id, module):
    list_priv = ['settings', 'forms_list'] if module == 'verifier' else ['settings', 'forms_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/disable/{form_id}'}), 403

    res = forms.disable_form(form_id, module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/<string:module>/enable/<int:form_id>', methods=['PUT'])
@auth.token_required
def enable_form(form_id, module):
    list_priv = ['settings', 'forms_list'] if module == 'verifier' else ['settings', 'forms_list_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/enable/{form_id}'}), 403

    res = forms.enable_form(form_id, module)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/<string:module>/updateFields/<int:form_id>', methods=['POST'])
@auth.token_required
def update_fields(form_id, module):
    list_priv = ['settings', 'add_form | update_form'] if module == 'verifier' \
        else ['settings', 'add_form_splitter | update_form_splitter']
    if not privileges.has_privileges(request.environ['user_id'], list_priv):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/forms/{module}/updateFields/{form_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'lines', 'type': dict, 'mandatory': True if module == 'verifier' else False},
        {'id': 'other', 'type': dict, 'mandatory': True if module == 'verifier' else False},
        {'id': 'supplier', 'type': dict, 'mandatory': True if module == 'verifier' else False},
        {'id': 'facturation', 'type': dict, 'mandatory': True if module == 'verifier' else False},
        {'id': 'batch_metadata', 'type': dict, 'mandatory': True if module == 'splitter' else False},
        {'id': 'document_metadata', 'type': dict, 'mandatory': True if module == 'splitter' else False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = forms.update_fields({'form_id': form_id, 'data': request.json})
    return make_response(jsonify(res[0])), res[1]
