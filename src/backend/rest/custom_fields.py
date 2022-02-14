import json
from flask import Blueprint, request, make_response, jsonify
from src.backend.import_controllers import auth
from src.backend.import_controllers import custom_fields

bp = Blueprint('customFields', __name__, url_prefix='/ws/')


@bp.route('customFields/list', methods=['GET'])
@auth.token_required
def retrieve_fields():
    res = custom_fields.retrieve_custom_fields({})
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/add', methods=['POST'])
@auth.token_required
def add_field():
    data = json.loads(request.data)
    res = custom_fields.add_custom_field(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/update', methods=['POST'])
@auth.token_required
def update_custom_field():
    data = json.loads(request.data)
    res = custom_fields.update(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/delete/<int:custom_field_id>', methods=['DELETE'])
@auth.token_required
def delete_custom_field(custom_field_id):
    res = custom_fields.delete({'custom_field_id': custom_field_id})
    return make_response(jsonify(res[0])), res[1]
