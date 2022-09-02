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

import json
from flask_babel import gettext
from src.backend.import_models import outputs


def get_outputs(args):
    _outputs = outputs.get_outputs(args)

    response = {
        "outputs": _outputs
    }
    return response, 200


def get_outputs_types(module):
    args = {
        'where': ['module = %s'],
        'data': [module],
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
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_OUTPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DUPLICATE_OUTPUT_ERROR'),
            "message": error
        }
        return response, 401


def update_output(output_id, args):
    _, error = outputs.get_output_by_id({'output_id': output_id})

    if error is None:
        _, error = outputs.update_output({
            'set': {
                'output_type_id': args['output_type_id'],
                'compress_type': args['compress_type'] if 'compress_type' in args else None,
                'output_label': args['output_label'],
                'data': json.dumps(args['data'])
            },
            'output_id': output_id
        })

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_OUTPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_OUTPUT_ERROR'),
            "message": error
        }
        return response, 401


def create_output(data):
    _columns = {
        'output_type_id': data['output_type_id'],
        'output_label': data['output_label'],
        'compress_type': data['compress_type'] if 'compress_type' in data else None,
        'module': data['module'],
    }

    res, error = outputs.create_output({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_OUTPUT_ERROR'),
            "message": error
        }
        return response, 401


def get_output_by_id(output_id):
    output_info, error = outputs.get_output_by_id({'output_id': output_id})

    if error is None:
        return output_info, 200
    else:
        response = {
            "errors": gettext('GET_OUTPUT_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def get_output_type_by_id(output_type_id):
    output_type_info, error = outputs.get_output_type_by_id({'output_type_id': output_type_id})

    if error is None:
        return output_type_info, 200
    else:
        response = {
            "errors": gettext('GET_OUTPUT_TYPE_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def delete_output(output_id):
    output_info, error = outputs.get_output_by_id({'output_id': output_id})
    if error is None:
        res, error = outputs.update_output({'set': {'status': 'DEL'}, 'output_id': output_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_OUTPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_OUTPUT_ERROR'),
            "message": error
        }
        return response, 401
