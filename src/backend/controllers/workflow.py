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

import os
import json
from flask import request, g as current_context
from flask_babel import gettext
from src.backend.import_models import workflow
from src.backend import retrieve_custom_from_url, create_classes_from_custom_id


def get_workflows(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'] if 'offset' in args else 0,
        'limit': args['limit'] if 'limit' in args else 'ALL',
        'where': ["status <> 'DEL'", "module = %s"],
        'data': [args['module'] if 'module' in args else '']
    }

    _workflows = workflow.get_workflows(_args)

    response = {
        "workflows": _workflows
    }
    return response, 200


def verify_input_folder(args):
    if 'input_folder' in args and args['input_folder']:
        if not os.path.exists(args['input_folder']):
            try:
                os.mkdir(args['input_folder'], mode=0o777)
            except (PermissionError, FileNotFoundError):
                response = {
                    "errors": gettext('WORKFLOW_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_CREATE_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        else:
            if not os.access(args['input_folder'], os.W_OK):
                response = {
                    "errors": gettext('WORKFLOW_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_ACCESS_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        return '', 200
    return '', 400


def get_workflow_by_id(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})

    if error is None:
        return workflow_info, 200
    else:
        response = {
            "errors": gettext('GET_WORKFLOW_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def duplicate_workflow(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})
    if error is None:
        args = {
            'module': workflow_info['module'],
            'workflow_id': 'copy_' + workflow_info['workflow_id'],
            'label': gettext('COPY_OF') + ' ' + workflow_info['label'],
            'input': json.dumps(workflow_info['input']),
            'process': json.dumps(workflow_info['process']),
            'separation': json.dumps(workflow_info['separation']),
            'output': json.dumps(workflow_info['output'])
        }

        _, error = workflow.create_workflow({'columns': args})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DUPLICATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def is_path_allowed(input_path):
    custom_id = retrieve_custom_from_url(request)
    if 'docservers' in current_context and 'configuration' in current_context:
        docservers = current_context.docservers
        configurations = current_context.configuration
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    if 'INPUTS_ALLOWED_PATH' in docservers and input_path and 'restrictInputsPath' in configurations and configurations['restrictInputsPath']:
        return input_path.startswith(docservers['INPUTS_ALLOWED_PATH'])
    else:
        return True


def create_workflow(data):
    if not is_path_allowed(data['input']['input_folder']):
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('NOT_ALLOWED_INPUT_PATH')
        }
        return response, 400

    workflow_info, error = get_workflows({
        'where': ['module = %s', 'workflow_id = %s'],
        'data': [data['module'], data['workflow_id']]
    })

    if workflow_info['workflows']:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('WORKFLOW_ID_ALREADY_EXISTS')
        }
        return response, 400

    workflow_info, error = get_workflows({
        'where': ['input_folder = %s', 'module = %s', 'status <> %s'],
        'data': [data['input']['input_folder'], data['module'], 'DEL']
    })
    if workflow_info['workflows']:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('INPUT_FOLDER_ALREADY_EXISTS')
        }
        return response, 400

    data['input'] = json.dumps(data['input'])
    data['process'] = json.dumps(data['process'])
    data['separation'] = json.dumps(data['separation'])
    data['output'] = json.dumps(data['output'])

    res, error = workflow.create_workflow({'columns': data})
    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_workflow(workflow_id, data):
    if not is_path_allowed(data['input']['input_folder']):
        response = {
            "errors": gettext('UPDATE_WORKFLOW_ERROR'),
            "message": gettext('NOT_ALLOWED_INPUT_PATH')
        }
        return response, 400

    _, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})

    if error is None:
        data['input'] = json.dumps(data['input'])
        data['process'] = json.dumps(data['process'])
        data['separation'] = json.dumps(data['separation'])
        data['output'] = json.dumps(data['output'])
        _, error = workflow.update_workflow({'set': data, 'workflow_id': workflow_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_workflow(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})
    if error is None:
        _, error = workflow.update_workflow({'set': {'status': 'DEL'}, 'workflow_id': workflow_id})
        if error is None:
            # delete_script_and_incron(workflow_info)
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400
