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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import glob
import base64
import os.path
import requests
import subprocess
from flask import request
from flask_babel import gettext
from ..models import config, history
from ..helpers import get_context_var
from ..functions import retrieve_custom_from_url, get_custom_path, retrieve_custom_list


def read_config():
    return get_context_var('config', 1), 200


def change_locale_in_config(lang):
    languages = get_context_var('languages', 11)

    language = {'label': 'Francais', 'lang_code': 'fra'}
    for _l in languages:
        if lang == languages[_l]['lang_code']:
            language = languages[_l]

    locale_configuration = retrieve_configuration_by_label('locale')[0]['configuration'][0]
    update_configuration_by_label({
        'value': language['lang_code'],
        'type': locale_configuration['data']['type'],
        'description': locale_configuration['data']['description']
    }, 'locale')

    history.add_history({
        'module': 'general',
        'ip': request.remote_addr,
        'submodule': 'language_changed',
        'user_info': request.environ['user_info'],
        'desc': gettext('LANGUAGE_CHANGED', lang=language['label'])
    })

    return {}, 200


def retrieve_configuration_by_label(label):
    configuration, error = config.retrieve_configurations({"where": ['label = %s'], 'data': [label]})
    if error is None:
        response = {
            "configuration": configuration
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_CONFIGURATION_ERRORS"),
        "message": gettext(error)
    }
    return response, 400


def retrieve_configurations(data):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['display = %s'],
        'data': [True],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL'
    }

    if 'search' in data and data['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(label) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(data ->> 'description') LIKE '%%" + data['search'].lower() + "%%')"
        )

    configurations, error = config.retrieve_configurations(args)
    if error is None:
        response = {
            "configurations": configurations
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_CONFIGURATIONS_ERRORS"),
        "message": gettext(error)
    }
    return response, 400


def retrieve_docservers(data):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': [],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL'
    }

    if 'search' in data and data['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(docserver_id) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(description) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(path) LIKE '%%" + data['search'].lower() + "%%')"
        )

    docservers, error = config.retrieve_docservers(args)

    if error is None:
        response = {
            "docservers": docservers
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_DOCSERVERS_ERRORS"),
        "message": gettext(error)
    }
    return response, 400


def retrieve_regex(data):
    configurations = get_context_var('configurations', 10)

    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ["lang in ('global', %s)"],
        'data': [configurations['locale']],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL'
    }

    if 'search' in data and data['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(regex_id) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(label) LIKE '%%" + data['search'].lower() + "%%') "
        )

    regex, error = config.retrieve_regex(args)

    if error is None:
        response = {
            "regex": regex
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_REGEX_ERRORS"),
        "message": gettext(error)
    }
    return response, 400

def retrieve_regex_by_regex_id(args):
    regex, error = config.retrieve_regex_by_regex_id(args)

    if error is None:
        response = {
            "regex": regex
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_REGEX_ERRORS"),
        "message": gettext(error)
    }
    return response, 400

def update_configuration_by_id(args, configuration_id):
    configuration, error = config.retrieve_configuration_by_id({'configuration_id': configuration_id})

    if error is None:
        if configuration[0]['label'] == 'jwtExpiration' and int(args['value']) <= 0:
            response = {
                "errors": gettext("UPDATE_CONFIGURATION_ERROR"),
                "message": gettext("JWT_EXPIRATION_COULDNT_BE_ZERO_OR_LESS")
            }
            return response, 400
        data = {
            'configuration_id': configuration_id,
            'data': {
                'value': args['value']
            }
        }

        if 'type' in args and args['type']:
            data['data']['type'] = args['type']
        if 'description' in args and args['description']:
            data['data']['description'] = args['description']
        if 'options' in args and args['options']:
            data['data']['options'] = args['options']

        config.update_configuration_by_id(data)
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'update_configuration',
            'user_info': request.environ['user_info'],
            'desc': gettext('UPDATE_CONFIGURATION', config=configuration_id)
        })
        return '', 200

    response = {
        "errors": gettext("UPDATE_CONFIGURATION_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def update_configuration_by_label(args, configuration_label):
    configuration, error = config.retrieve_configuration_by_label({'configuration_label': configuration_label})

    if error is None:
        if configuration[0]['label'] == 'jwtExpiration' and int(args['value']) <= 0:
            response = {
                "errors": gettext("UPDATE_CONFIGURATION_ERROR"),
                "message": gettext("JWT_EXPIRATION_COULDNT_BE_ZERO_OR_LESS")
            }
            return response, 400
        data = {
            'configuration_label': configuration_label,
            'data': {
                'value': args['value']
            }
        }

        if 'type' in args and args['type']:
            data['data']['type'] = args['type']
        if 'description' in args and args['description']:
            data['data']['description'] = args['description']

        config.update_configuration_by_label(data)
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'update_configuration',
            'user_info': request.environ['user_info'],
            'desc': gettext('UPDATE_CONFIGURATION', config=configuration_label)
        })
        return '', 200

    response = {
        "errors": gettext("UPDATE_CONFIGURATION_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def update_regex(args, regex_id):
    _, error = config.retrieve_regex_by_id({'id': regex_id})

    if error is None:
        data = {
            'id': regex_id,
            'data': {
                'label': args['label'],
                'content': args['content']
            }
        }
        config.update_regex(data)
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'update_regex',
            'user_info': request.environ['user_info'],
            'desc': gettext('UPDATE_REGEX', regex=args['label'])
        })
        return '', 200

    response = {
        "errors": gettext("UPDATE_REGEX_ERROR"),
        "message": gettext(error)
    }
    return response, 400


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
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'update_docserver',
            'user_info': request.environ['user_info'],
            'desc': gettext('UPDATE_DOCSERVER', docserver=args['docserver_id'])
        })
        return '', 200

    response = {
        "errors": gettext("UPDATE_DOCSERVER_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def get_last_git_version():
    try:
        requests.get('https://github.com/edissyum/opencapture', timeout=5)
    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
        return None

    latest_git_version = subprocess.Popen("git ls-remote --tags --sort='v:refname' "
                                          "https://github.com/edissyum/opencapture.git | "
                                          r"tail -n1 |  sed 's/.*\///; s/\^{}//' | grep -E '3.+([0-9])$'", shell=True,
                                          stdout=subprocess.PIPE).stdout.read()
    return str(latest_git_version.decode('utf-8').strip())


def get_login_image():
    custom_id = retrieve_custom_from_url(request)
    login_image = 'src/assets/imgs/login_image.svg'
    if custom_id:
        custom_path = get_custom_path(custom_id)
        if custom_path:
            for file in glob.glob(custom_path + '/assets/imgs/login_image.*'):
                login_image = file
                break
    with open(login_image, 'rb') as image_file:
        b64_content = str(base64.b64encode(image_file.read()).decode('utf-8'))
        extension = login_image.split('.')[-1]
        if extension == 'svg':
            extension =  'svg+xml'
        b64_content = 'data:image/' + extension + ';base64,' + b64_content

    return b64_content, 200


def update_login_image(image_content):
    custom_id = retrieve_custom_from_url(request)
    if custom_id:
        custom_path = get_custom_path(custom_id)
        if custom_path:
            mime_type = str(image_content).split(';')[0].replace('data:', '')
            extension = mime_type.split('/')[1]
            if extension == 'svg+xml':
                extension = 'svg'

            image_data = base64.b64decode(str(image_content).replace(f'data:{mime_type};base64,', ''))
            image_path = custom_path + '/assets/imgs/'
            if not os.path.isdir(image_path):
                return {
                    "errors": gettext("ERROR_UPDATING_IMAGE"),
                    "message": gettext("CUSTOM_IMAGE_PATH_NOT_WRITEABLE_OR_NOT_EXISTS")
                }, 400

            for f in glob.glob(image_path + "/login_image.*"):
                os.remove(f)

            image_filename = 'login_image.' + extension
            with open(image_path + '/' + image_filename, 'wb') as image_handler:
                image_handler.write(image_data)

            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'update_login_image',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_LOGIN_IMAGE')
            })
            return '', 200
        else:
            return {
               "errors": gettext("ERROR_UPDATING_IMAGE"),
               "message": gettext("CUSTOM_IMAGE_PATH_NOT_WRITEABLE_OR_NOT_EXISTS")
            }, 400
    else:
        return {
           "errors": gettext("ERROR_UPDATING_IMAGE"),
           "message": gettext("CUSTOM_NOT_PRESENT")
        }, 400

def get_favorites(args):
    favorites, error = config.get_favorites(args)

    if error is None:
        return favorites, 200

    response = {
        "errors": gettext("RETRIEVE_FAVORITES_ERRORS"),
        "message": gettext(error)
    }
    return response, 400

def add_favorites(args):
    favorite, error = config.add_favorites(args)
    if error is None:
        return favorite, 200

    response = {
        "errors": gettext("ADD_FAVORITE_ERROR"),
        "message": gettext(error)
    }
    return response, 400

def remove_favorites(favorite_id):
    config.remove_favorites(favorite_id)
    return '', 200

def get_customs_list():
    customs = retrieve_custom_list()
    return {'customs': customs}, 200

def get_packages():
    with open('pip-requirements.txt', 'r') as f:
        packages = [line.strip() for line in f if line.strip() and not line.startswith('#') and not line.startswith('--')]

    return packages