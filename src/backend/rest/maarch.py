# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from src.backend.import_controllers import auth, maarch
from flask import Blueprint, request, make_response, jsonify

bp = Blueprint('maarch', __name__, url_prefix='/ws/')


@bp.route('maarch/testConnection', methods=['POST'])
@auth.token_required
def test_connection():
    data = request.json['args']
    connection = maarch.test_connection(data)
    return make_response(jsonify({'status': connection}), 200)


@bp.route('maarch/getUsers', methods=['POST'])
@auth.token_required
def get_users():
    data = request.json['args']
    users = maarch.get_users(data)
    return make_response(jsonify(users)), 200


@bp.route('maarch/getDoctypes', methods=['POST'])
@auth.token_required
def get_doctypes():
    data = request.json['args']
    doctypes = maarch.get_doctypes(data)
    return make_response(jsonify(doctypes)), 200


@bp.route('maarch/getEntities', methods=['POST'])
@auth.token_required
def get_entities():
    data = request.json['args']
    entities = maarch.get_entities(data)
    return make_response(jsonify(entities)), 200


@bp.route('maarch/getCustomFields', methods=['POST'])
@auth.token_required
def get_custom_fields():
    data = request.json['args']
    entities = maarch.get_custom_fields(data)
    return make_response(jsonify(entities)), 200


@bp.route('maarch/getContactsCustomFields', methods=['POST'])
@auth.token_required
def get_contact_custom_fields():
    data = request.json['args']
    entities = maarch.get_contact_custom_fields(data)
    return make_response(jsonify(entities)), 200


@bp.route('maarch/getPriorities', methods=['POST'])
@auth.token_required
def get_priorities():
    data = request.json['args']
    priorities = maarch.get_priorities(data)
    return make_response(jsonify(priorities)), 200


@bp.route('maarch/getStatuses', methods=['POST'])
@auth.token_required
def get_statuses():
    data = request.json['args']
    statuses = maarch.get_statuses(data)
    return make_response(jsonify(statuses)), 200


@bp.route('maarch/getIndexingModels', methods=['POST'])
@auth.token_required
def get_indexing_models():
    data = request.json['args']
    indexing_models = maarch.get_indexing_models(data)
    return make_response(jsonify(indexing_models)), 200
