# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import json
from flask_babel import gettext
from ..import_models import outputs
from ..main import create_classes_from_current_config


def get_outputs(args):
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    _outputs = outputs.get_outputs(args)

    response = {
        "outputs": _outputs
    }
    return response, 200


def get_outputs_types():
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    _outputs_types = outputs.get_outputs_types()

    response = {
        "outputs_types": _outputs_types
    }
    return response, 200


def update_output(output_id, args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    output_info, error = outputs.get_output_by_id({'output_id': output_id})

    if error is None:
        res, error = outputs.update_output({
            'set': {
                'output_type_id': args['output_type_id'],
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _columns = {
        'output_type_id': data['output_type_id'],
        'output_label': data['output_label'],
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

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
