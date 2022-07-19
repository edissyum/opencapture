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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from src.backend.import_controllers import auth, config
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import Blueprint, jsonify, make_response, request

bp = Blueprint('config', __name__,  url_prefix='/ws/')


@bp.route('config/readConfig', methods=['GET'])
@auth.token_required
def read_config():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    return make_response(jsonify({'config': _vars[1].cfg})), 200


@bp.route('config/getConfigurations', methods=['GET'])
@auth.token_required
def get_configurations():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': [],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }

    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(label) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(data ->> 'description') LIKE '%%" + request.args['search'].lower() + "%%')"
        )
    res = config.retrieve_configurations(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getConfiguration/<string:config_label>', methods=['GET'])
def get_configuration_by_label(config_label):
    res = config.retrieve_configuration_by_label(config_label)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getDocservers', methods=['GET'])
@auth.token_required
def get_docservers():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': [],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }

    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(label) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(data ->> 'description') LIKE '%%" + request.args['search'].lower() + "%%')"
        )
    res = config.retrieve_docservers(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getRegex', methods=['GET'])
@auth.token_required
def get_regex():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    configurations = _vars[10]

    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ["lang in ('global', %s)"],
        'data': [configurations['locale']],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }

    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(regex_id) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(label) LIKE '%%" + request.args['search'].lower() + "%%') "
        )
    res = config.retrieve_regex(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateRegex/<int:_id>', methods=['PUT'])
@auth.token_required
def update_regex(_id):
    data = request.json['data']
    res = config.update_regex(data, _id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getLoginImage', methods=['GET'])
def get_login_image():
    res = config.get_login_image()
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateLoginimage', methods=['PUT'])
def update_login_image():
    image_content = request.json['args']['image_content']
    res = config.update_login_image(image_content)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateConfiguration/<int:configuration_id>', methods=['PUT'])
@auth.token_required
def update_configuration(configuration_id):
    data = request.json['data']
    res = config.update_configuration(data, configuration_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateDocserver/<int:docserver_id>', methods=['PUT'])
@auth.token_required
def update_docserver(docserver_id):
    data = request.json['data']
    res = config.update_docserver(data, docserver_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/gitInfo', methods=['GET'])
@auth.token_required
def get_git_info():
    return make_response({
        'git_latest': config.get_last_git_version()
    }), 200
