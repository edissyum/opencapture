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

import os
import json
from flask import request
from flask_babel import gettext

from ..helpers import get_context_var
from ..models import outputs, history
from ..functions import check_order_by


def get_outputs(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'] if 'offset' in args else 0,
        'limit': args['limit'] if 'limit' in args else 'ALL',
        'where': ["status <> 'DEL'", "module = %s"],
        'data': [args['module'] if 'module' in args else '']
    }

    if 'filter' in args and args['filter']:
        allowed_filters = ['id', 'output_label']
        check_order, error = check_order_by(args['filter'], args['order'], allowed_filters)
        if not check_order:
            response = {
                "errors": gettext('FILTERS_ERROR'),
                "message": error
            }
            return response, 400

        _args['order_by'] = args['filter']
        if 'order' in args and args['order']:
            _args['order_by'] = [args['filter'] + ' ' + args['order']]
        else:
            _args['order_by'] = [args['filter'] + ' DESC']

    if 'search' in args and args['search']:
        _args['where'].append("output_label ILIKE %s")
        _args['data'].append(f"%{args['search']}%")

    _outputs = outputs.get_outputs(_args)

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
            'output_label': gettext('COPY_OF') + ' ' + output_info['output_label']
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
    docservers = get_context_var('docservers', 9)
    configurations = get_context_var('configurations', 10)

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
        'module': data['module'],
        'data': json.dumps(data['data'])
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
    docservers = get_context_var('docservers', 9)
    configurations = get_context_var('configurations', 10)

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
