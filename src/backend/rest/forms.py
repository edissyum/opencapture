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

from src.backend.import_controllers import auth, forms
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('forms', __name__, url_prefix='/ws/')


@bp.route('forms/list', methods=['GET'])
@auth.token_required
def get_forms():
    args = request.args
    res = forms.get_forms(args)
    return make_response(jsonify(res[0]), res[1])


@bp.route('forms/create', methods=['POST'])
@auth.token_required
def create_form():
    args = request.json['args']
    res = forms.create_form(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/getById/<int:form_id>', methods=['GET'])
@auth.token_required
def get_form_by_id(form_id):
    _form = forms.get_form_by_id(form_id)
    return make_response(jsonify(_form[0])), _form[1]


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


@bp.route('forms/update/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form(form_id):
    args = request.json['args']
    res = forms.update_form(form_id, args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateLabel/<int:form_id>/<string:category_id>', methods=['PUT'])
@auth.token_required
def update_form_label(form_id, category_id):
    label = request.json['label']
    res = forms.update_form_label(form_id, category_id, label)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateDisplay/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form_display(form_id):
    display = request.json
    res = forms.update_form(form_id, {"settings": {"display": display}})
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/delete/<int:form_id>', methods=['DELETE'])
@auth.token_required
def delete_form(form_id):
    res = forms.delete_form(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/duplicate/<int:form_id>', methods=['POST'])
@auth.token_required
def duplicate_form(form_id):
    res = forms.duplicate_form(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/disable/<int:form_id>', methods=['PUT'])
@auth.token_required
def disable_form(form_id):
    res = forms.disable_form(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/enable/<int:form_id>', methods=['PUT'])
@auth.token_required
def enable_form(form_id):
    res = forms.enable_form(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/getFields/<int:form_id>', methods=['GET'])
@auth.token_required
def get_fields(form_id):
    res = forms.get_fields(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateFields/<int:form_id>', methods=['POST'])
@auth.token_required
def update_fields(form_id):
    args = request.json
    res = forms.update_fields({'form_id': form_id, 'args': args})
    return make_response(jsonify(res[0])), res[1]
