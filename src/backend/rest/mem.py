# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from src.backend.functions import rest_validator
from src.backend.controllers import auth, mem
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('mem', __name__, url_prefix='/ws/')


@bp.route('mem/testConnection', methods=['POST'])
@auth.token_required
def test_connection():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    connection = mem.test_connection(request.json['args'])
    return make_response(jsonify({'status': connection}), 200)


@bp.route('mem/getUsers', methods=['POST'])
@auth.token_required
def get_users():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    users = mem.get_users(request.json['args'])
    return make_response(jsonify(users)), 200


@bp.route('mem/getDoctypes', methods=['POST'])
@auth.token_required
def get_doctypes():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    doctypes = mem.get_doctypes(request.json['args'])
    return make_response(jsonify(doctypes)), 200


@bp.route('mem/getEntities', methods=['POST'])
@auth.token_required
def get_entities():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    entities = mem.get_entities(request.json['args'])
    return make_response(jsonify(entities)), 200


@bp.route('mem/getCustomFields', methods=['POST'])
@auth.token_required
def get_custom_fields():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    entities = mem.get_custom_fields(request.json['args'])
    return make_response(jsonify(entities)), 200


@bp.route('mem/getContactsCustomFields', methods=['POST'])
@auth.token_required
def get_contact_custom_fields():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    entities = mem.get_contact_custom_fields(request.json['args'])
    return make_response(jsonify(entities)), 200


@bp.route('mem/getPriorities', methods=['POST'])
@auth.token_required
def get_priorities():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    priorities = mem.get_priorities(request.json['args'])
    return make_response(jsonify(priorities)), 200


@bp.route('mem/getStatuses', methods=['POST'])
@auth.token_required
def get_statuses():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    statuses = mem.get_statuses(request.json['args'])
    return make_response(jsonify(statuses)), 200


@bp.route('mem/getDocumentsWithContact', methods=['POST'])
@auth.token_required
def get_document_with_args():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    args = request.json['args']
    contact = mem.retrieve_contact(args)
    if contact and contact['contacts'] and contact['count'] > 0:
        args['contactId'] = str(contact['contacts'][0]['id'])
        resources = mem.get_document_with_contact(args)
        if resources:
            return make_response(resources), 200
    return make_response(''), 204


@bp.route('mem/getIndexingModels', methods=['POST'])
@auth.token_required
def get_indexing_models():
    check, message = rest_validator(request.json['args'], [
        {'id': 'host', 'type': str, 'mandatory': True},
        {'id': 'login', 'type': str, 'mandatory': True},
        {'id': 'password', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    indexing_models = mem.get_indexing_models(request.json['args'])
    return make_response(jsonify(indexing_models)), 200
