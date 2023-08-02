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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import os
import json
from flask_babel import gettext
from flask import request, g as current_context
from src.backend.import_models import outputs, history
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def get_outputs(data):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL',
        'where': ["status <> 'DEL'", "module = %s"],
        'data': [data['module'] if 'module' in data else '']
    }
    _outputs = outputs.get_outputs(args)

    response = {
        "outputs": _outputs
    }
    return response, 200


def get_outputs_types(module):
    args = {
        'where': ['module = %s'],
        'data': [module]
    }
    _outputs_types = outputs.get_outputs_types(args)

    response = {
        "outputs_types": _outputs_types
    }
    return response, 200


def duplicate_output(output_id):
    output_info, error = outputs.get_output_by_id({'output_id': output_id})
    if error is None:
        args = {
            'data': json.dumps(output_info['data']),
            'status': output_info['status'],
            'module': output_info['module'],
            'compress_type': output_info['compress_type'],
            'output_type_id': output_info['output_type_id'],
            'output_label': gettext('COPY_OF') + ' ' + output_info['output_label'],
        }
        _, error = outputs.create_output({'columns': args})
        if error is None:
            history.add_history({
                'module': output_info['module'],
                'ip': request.remote_addr,
                'submodule': 'duplicate_output',
                'user_info': request.environ['user_info'],
                'desc': gettext('DUPLICATE_OUTPUT', output=output_info['output_label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_OUTPUT_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DUPLICATE_OUTPUT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def is_path_allowed(parameters):
    custom_id = retrieve_custom_from_url(request)
    if 'docservers' in current_context and 'configuration' in current_context:
        docservers = current_context.docservers
        configurations = current_context.configuration
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    if 'OUTPUTS_ALLOWED_PATH' in docservers and 'restrictOutputsPath' in configurations and configurations['restrictOutputsPath']:
        for parameter in parameters:
            if parameter['id'] == 'folder_out' and parameter['value']:
                return parameter['value'].startswith(docservers['OUTPUTS_ALLOWED_PATH'])
            else:
                return True
    else:
        return True


def update_output(output_id, data):
    if not is_path_allowed(data['data']['options']['parameters']):
        response = {
            "errors": gettext('UPDATE_OUTPUT_ERROR'),
            "message": gettext('NOT_ALLOWED_OUTPUT_PATH')
        }
        return response, 400

    output_info, error = outputs.get_output_by_id({'output_id': output_id})
    if error is None:
        _, error = outputs.update_output({
            'set': {
                'output_type_id': data['output_type_id'],
                'compress_type': data['compress_type'] if 'compress_type' in data else None,
                'ocrise': data['ocrise'] if 'ocrise' in data else False,
                'output_label': data['output_label'],
                'data': json.dumps(data['data'])
            },
            'output_id': output_id
        })

        if error is None:
            history.add_history({
                'module': output_info['module'],
                'ip': request.remote_addr,
                'submodule': 'update_output',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_OUTPUT', output=output_info['output_label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_OUTPUT_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_OUTPUT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_output(data):
    _columns = {
        'output_type_id': data['output_type_id'],
        'output_label': data['output_label'],
        'compress_type': data['compress_type'] if 'compress_type' in data else None,
        'ocrise': data['ocrise'] if 'ocrise' in data else False,
        'module': data['module']
    }

    res, error = outputs.create_output({'columns': _columns})

    if error is None:
        history.add_history({
            'module': data['module'],
            'ip': request.remote_addr,
            'submodule': 'create_output',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_OUTPUT', output=data['output_label'])
        })
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_OUTPUT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_output_by_id(output_id):
    output_info, error = outputs.get_output_by_id({'output_id': output_id})

    if error is None:
        return output_info, 200
    else:
        response = {
            "errors": gettext('GET_OUTPUT_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_output_type_by_id(output_type_id):
    output_type_info, error = outputs.get_output_type_by_id({'output_type_id': output_type_id})

    if error is None:
        return output_type_info, 200
    else:
        response = {
            "errors": gettext('GET_OUTPUT_TYPE_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_output(output_id):
    output_info, error = outputs.get_output_by_id({'output_id': output_id})
    if error is None:
        _, error = outputs.update_output({'set': {'status': 'DEL'}, 'output_id': output_id})
        if error is None:
            history.add_history({
                'module': output_info['module'],
                'ip': request.remote_addr,
                'submodule': 'delete_output',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_OUTPUT', output=output_info['output_label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_OUTPUT_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_OUTPUT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_allowed_path():
    custom_id = retrieve_custom_from_url(request)
    if 'docservers' in current_context and 'configurations' in current_context:
        docservers = current_context.docservers
        configurations = current_context.configurations
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    if configurations['restrictOutputsPath'] and 'OUTPUTS_ALLOWED_PATH' in docservers:
        response = {'allowedPath': docservers['OUTPUTS_ALLOWED_PATH']}
    else:
        response = {'allowedPath': ''}

    return response, 200


def verify_folder_out(args):
    if 'folder_out' in args and args['folder_out']:
        if not is_path_allowed(args['folder_out']):
            response = {
                "errors": gettext('OUTPUT_FOLDER_CREATION_ERROR'),
                "message": gettext('FOLDER_NOT_ALLOWED_ERROR')
            }
            return response, 400
        elif not os.path.exists(args['folder_out']):
            try:
                os.mkdir(args['folder_out'], mode=0o777)
            except (PermissionError, FileNotFoundError, TypeError):
                response = {
                    "errors": gettext('OUTPUT_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_CREATE_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        else:
            if not os.access(args['folder_out'], os.W_OK):
                response = {
                    "errors": gettext('OUTPUT_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_ACCESS_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        return '', 200
    return '', 400
