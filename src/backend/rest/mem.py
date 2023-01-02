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

from src.backend.import_controllers import auth, mem
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('mem', __name__, url_prefix='/ws/')


@bp.route('mem/testConnection', methods=['POST'])
@auth.token_required
def test_connection():
    data = request.json['args']
    connection = mem.test_connection(data)
    return make_response(jsonify({'status': connection}), 200)


@bp.route('mem/getUsers', methods=['POST'])
@auth.token_required
def get_users():
    data = request.json['args']
    users = mem.get_users(data)
    return make_response(jsonify(users)), 200


@bp.route('mem/getDoctypes', methods=['POST'])
@auth.token_required
def get_doctypes():
    data = request.json['args']
    doctypes = mem.get_doctypes(data)
    return make_response(jsonify(doctypes)), 200


@bp.route('mem/getEntities', methods=['POST'])
@auth.token_required
def get_entities():
    data = request.json['args']
    entities = mem.get_entities(data)
    return make_response(jsonify(entities)), 200


@bp.route('mem/getCustomFields', methods=['POST'])
@auth.token_required
def get_custom_fields():
    data = request.json['args']
    entities = mem.get_custom_fields(data)
    return make_response(jsonify(entities)), 200


@bp.route('mem/getContactsCustomFields', methods=['POST'])
@auth.token_required
def get_contact_custom_fields():
    data = request.json['args']
    entities = mem.get_contact_custom_fields(data)
    return make_response(jsonify(entities)), 200


@bp.route('mem/getPriorities', methods=['POST'])
@auth.token_required
def get_priorities():
    data = request.json['args']
    priorities = mem.get_priorities(data)
    return make_response(jsonify(priorities)), 200


@bp.route('mem/getStatuses', methods=['POST'])
@auth.token_required
def get_statuses():
    data = request.json['args']
    statuses = mem.get_statuses(data)
    return make_response(jsonify(statuses)), 200


@bp.route('mem/getDocumentsWithContact', methods=['POST'])
@auth.token_required
def get_document_with_args():
    data = request.json
    contact = mem.retrieve_contact(data)
    if contact and contact['contacts'] and contact['count'] > 0:
        data['contactId'] = str(contact['contacts'][0]['id'])
        resources = mem.get_document_with_contact(data)
        if resources:
            return make_response(resources), 200
    return make_response(''), 204


@bp.route('mem/getIndexingModels', methods=['POST'])
@auth.token_required
def get_indexing_models():
    data = request.json['args']
    indexing_models = mem.get_indexing_models(data)
    return make_response(jsonify(indexing_models)), 200
