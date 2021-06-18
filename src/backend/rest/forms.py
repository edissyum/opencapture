import json
from flask import Blueprint, request, make_response, jsonify
from ..import_controllers import auth
from ..import_controllers import forms

bp = Blueprint('forms', __name__, url_prefix='/ws/')


@bp.route('forms/list', methods=['GET'])
@auth.token_required
def get_forms():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'where': ["status <> 'DEL'"]
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


@bp.route('forms/update/<int:form_id>', methods=['PUT'])
@auth.token_required
def update_form(form_id):
    data = request.json['args']
    res = forms.update_form(form_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/delete/<int:form_id>', methods=['DELETE'])
@auth.token_required
def delete_form(form_id):
    res = forms.delete_form(form_id)
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
