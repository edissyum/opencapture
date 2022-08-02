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

import base64
import os.path
import requests
import subprocess
from flask import request
from flask_babel import gettext
from src.backend.import_models import config
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def change_locale_in_config(lang):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    languages = _vars[11]
    language = {'label': 'Francais', 'lang_code': 'fra'}
    for _l in languages:
        if lang == languages[_l]['lang_code']:
            language = languages[_l]

    locale_configuration = retrieve_configuration_by_label('locale')[0]['configuration'][0]
    update_configuration({
        'value': language['lang_code'],
        'type': locale_configuration['data']['type'],
        'description': locale_configuration['data']['description']
    }, locale_configuration['id'])

    return {}, 200


def retrieve_configuration_by_label(label):
    configuration, error = config.retrieve_configurations({"where": ['label = %s'], 'data': [label]})

    if error is None:
        response = {
            "configuration": configuration
        }
        return response, 200

    response = {
        "errors": "RETRIEVE_CONFIGURATION_ERRORS",
        "message": error
    }
    return response, 401


def retrieve_configurations(args):
    configurations, error = config.retrieve_configurations(args)

    if error is None:
        response = {
            "configurations": configurations
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_CONFIGURATIONS_ERRORS"),
        "message": error
    }
    return response, 401


def retrieve_docservers(args):
    docservers, error = config.retrieve_docservers(args)

    if error is None:
        response = {
            "docservers": docservers
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_DOCSERVERS_ERRORS"),
        "message": error
    }
    return response, 401


def retrieve_regex(args):
    regex, error = config.retrieve_regex(args)

    if error is None:
        response = {
            "regex": regex
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_REGEX_ERRORS"),
        "message": error
    }
    return response, 401


def update_configuration(args, configuration_id):
    _, error = config.retrieve_configuration_by_id({'configuration_id': configuration_id})

    if error is None:
        args = {
            'configuration_id': configuration_id,
            'data': {
                'type': args['type'],
                'value': args['value'],
                'description': args['description']
            }
        }
        config.update_configuration(args)
        return '', 200

    response = {
        "errors": gettext("UPDATE_CONFIGURATION_ERROR"),
        "message": error
    }
    return response, 401


def update_regex(args, regex_id):
    _, error = config.retrieve_regex_by_id({'id': regex_id})

    if error is None:
        args = {
            'id': regex_id,
            'data': {
                'label': args['label'],
                'content': args['content'],
            }
        }
        config.update_regex(args)
        return '', 200

    response = {
        "errors": gettext("UPDATE_REGEX_ERROR"),
        "message": error
    }
    return response, 401


def update_docserver(args, docserver_id):
    _, error = config.retrieve_docserver_by_id({'docserver_id': docserver_id})

    if error is None:
        args = {
            'id': args['id'],
            'path': args['path'],
            'description': args['description'],
            'docserver_id': args['docserver_id']
        }
        config.update_docserver(args)
        return '', 200

    response = {
        "errors": gettext("UPDATE_DOCSERVER_ERROR"),
        "message": error
    }
    return response, 401


def get_last_git_version():
    try:
        requests.get('https://github.com/edissyum/opencaptureforinvoices', timeout=5)
    except requests.exceptions.ConnectionError:
        return None
    latest_git_version = subprocess.Popen("git ls-remote --tags --sort='v:refname' "
                                          "https://github.com/edissyum/opencaptureforinvoices.git | "
                                          "tail -n1 |  sed 's/.*\///; s/\^{}//' | grep -E '2.+([0-9])$'", shell=True,
                                          stdout=subprocess.PIPE).stdout.read()
    return str(latest_git_version.decode('utf-8').strip())


def get_login_image():
    custom_id = retrieve_custom_from_url(request)
    login_image = 'src/assets/imgs/login_image.png'
    if custom_id:
        if os.path.isfile('custom/' + custom_id + '/assets/imgs/login_image.png'):
            login_image = 'custom/' + custom_id + '/assets/imgs/login_image.png'

    with open(login_image, 'rb') as image_file:
        b64_content = str(base64.b64encode(image_file.read()).decode('UTF-8'))
    return b64_content, 200


def update_login_image(image_content):
    custom_id = retrieve_custom_from_url(request)
    if custom_id:
        image_data = base64.b64decode(str(image_content).replace('data:image/png;base64,', ''))
        image_path = 'custom/' + custom_id + '/assets/imgs/'
        if not os.path.isdir(image_path):
            return {
                "errors": gettext("ERROR_UPDATING_IMAGE"),
                "message": gettext("CUSTOM_IMAGE_PATH_NOT_WRITEABLE")
            }, 401
        image_filename = 'login_image.png'
        image_handler = open(image_path + '/' + image_filename, 'wb')
        image_handler.write(image_data)
        image_handler.close()
        return '', 200
    else:
        return {
           "errors": gettext("ERROR_UPDATING_IMAGE"),
           "message": gettext("CUSTOM_NOT_PRESENT")
        }, 401
