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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.import_controllers import auth, config, privileges
from flask import Blueprint, jsonify, make_response, request, g as current_context

bp = Blueprint('config', __name__,  url_prefix='/ws/')


@bp.route('config/readConfig', methods=['GET'])
@auth.token_required
def read_config():
    if not privileges.has_privileges(request.environ['user_id'], ['access_config']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/config/readConfig'}), 403

    configurations = config.read_config()
    return make_response(jsonify({'config': configurations})), 200


@bp.route('config/getConfigurations', methods=['GET'])
@auth.token_required
def get_configurations():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/config/getConfigurations'}), 403

    res = config.retrieve_configurations(request.args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getConfiguration/<string:config_label>', methods=['GET'])
@auth.token_required
def get_configuration_by_label(config_label):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/config/getConfiguration/{config_label}'}), 403

    res = config.retrieve_configuration_by_label(config_label)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getConfigurationNoAuth/<string:config_label>', methods=['GET'])
def get_configuration_by_label_simple(config_label):
    if config_label not in ('loginMessage', 'passwordRules'):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/config/getConfigurationNoAuth/{config_label}'}), 403

    res = config.retrieve_configuration_by_label(config_label)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getDocservers', methods=['GET'])
@auth.token_required
def get_docservers():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'docservers']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/config/getDocservers'}), 403

    res = config.retrieve_docservers(request.args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getRegex', methods=['GET'])
@auth.token_required
def get_regex():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'regex']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/config/getRegex'}), 403

    res = config.retrieve_regex(request.args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateRegex/<int:regex_id>', methods=['PUT'])
@auth.token_required
def update_regex(regex_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'regex']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'config/updateRegex/{regex_id}'}), 403

    args = request.json['args']
    res = config.update_regex(args, regex_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/getLoginImage', methods=['GET'])
def get_login_image():
    res = config.get_login_image()
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateLoginImage', methods=['PUT'])
@auth.token_required
def update_login_image():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/config/updateLoginImage'}), 403

    image_content = request.json['args']['image_content']
    res = config.update_login_image(image_content)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateConfiguration/<int:configuration_id>', methods=['PUT'])
@auth.token_required
def update_configuration_by_id(configuration_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/config/updateConfiguration/{configuration_id}'}), 403
    args = request.json['data']
    res = config.update_configuration_by_id(args, configuration_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateConfiguration/<string:configuration_label>', methods=['PUT'])
@auth.token_required
def update_configuration_by_label(configuration_label):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/config/updateConfiguration/{configuration_label}'}), 403

    args = request.json['args']
    res = config.update_configuration_by_label(args, configuration_label)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/updateDocserver/<int:docserver_id>', methods=['PUT'])
@auth.token_required
def update_docserver(docserver_id):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'docservers']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/config/updateDocserver/{docserver_id}'}), 403

    args = request.json['args']
    res = config.update_docserver(args, docserver_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('config/gitInfo', methods=['GET'])
def get_git_info():
    return make_response({
        'git_latest': config.get_last_git_version()
    }), 200
