import json
from flask import Blueprint, request, make_response, jsonify
from ..controllers.auth import token_required
from ..import_controllers import forms

bp = Blueprint('forms', __name__, url_prefix='/ws/')


@bp.route('forms/list', methods=['GET'])
@token_required
def retrieve_forms():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    res = forms.retrieve_forms(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/add', methods=['POST'])
@token_required
def add_form():
    data = json.loads(request.data)
    res = forms.add_form(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('forms/update', methods=['POST'])
@token_required
def update_form():
    data = json.loads(request.data)
    res = forms.update(data)
    return make_response(jsonify(res[0])), res[1]
