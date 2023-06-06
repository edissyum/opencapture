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
from src.backend.import_models import roles


def get_roles(args):
    _roles = roles.get_roles(args)

    response = {
        "roles": _roles
    }
    return response, 200


def update_role(role_id, data):
    _, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        _set = {
            'label': data['label'],
            'enabled': data['enabled'],
            'sub_roles': json.dumps(data['sub_roles']),
            'label_short': data['label_short']
        }
        _, error = roles.update_role({'set': _set, 'role_id': role_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ROLE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_role(data):
    _columns = {
        'label': data['label'],
        'label_short': data['label_short'],
    }

    res, error = roles.create_role({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        roles.create_role_privileges({'role_id': res})
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_role_privilege(role_id, privileges):
    _, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        _set = {
            'privileges_id': '{"data": "' + str(privileges) + '"}',
        }

        _, error = roles.update_role_privileges({'set': _set, 'role_id': role_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ROLE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_role_by_id(role_id):
    role_info, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        return role_info, 200
    else:
        response = {
            "errors": gettext('GET_ROLE_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_role(role_id):
    _, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        _, error = roles.update_role({'set': {'status': 'DEL'}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_ROLE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def disable_role(role_id):
    _, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        _, error = roles.update_role({'set': {'enabled': False}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_ROLE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DISABLE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def enable_role(role_id):
    _, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        _, error = roles.update_role({'set': {'enabled': True}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_ROLE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('ENABLE_ROLE_ERROR'),
            "message": gettext(error)
        }
        return response, 400
