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
import json

from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth
from src.backend.import_controllers import forms

bp = Blueprint('forms', __name__, url_prefix='/ws/')


@bp.route('forms/list', methods=['GET'])
@auth.token_required
def get_forms():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'where': ["status <> 'DEL'", "module like %s"],
        'data': [request.args['module']] if 'module' in request.args else '%',
        'totals': 'totals' in request.args and request.args['totals'] == 'true',
        'status': request.args['status'] if 'status' in request.args and request.args['status'] else 'NEW',
        'time': request.args['time'] if 'time' in request.args and request.args['status'] else 'today',
        'user_id': request.args['user_id'] if 'user_id' in request.args and request.args['user_id'] else None
    }
    res = forms.get_forms(args)
    return make_response(jsonify(res[0]), res[1])


@bp.route('forms/add', methods=['POST'])
@auth.token_required
def add_form():
    data = request.json['args']
    res = forms.add_form(data)
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


@bp.route('forms/getDefault', methods=['GET'])
@auth.token_required
def get_default_form():
    _form = forms.get_default_form()
    return make_response(jsonify(_form[0])), _form[1]


@bp.route('forms/update/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form(form_id):
    data = request.json['args']
    res = forms.update_form(form_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/updateDisplay/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form_display(form_id):
    display = request.json
    res = forms.update_form(form_id, {"display": json.dumps(display)})
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
    data = request.json
    res = forms.update_fields({'form_id': form_id, 'data': data})
    return make_response(jsonify(res[0])), res[1]
