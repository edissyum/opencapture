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
# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import json
from flask import request
from flask_babel import gettext
from src.backend.import_models import roles, history, user


def get_roles(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'],
        'limit': args['limit']
    }

    if args['full']:
        _args['where'] = ['status NOT IN (%s)']
        _args['data'] = ['DEL']
    else:
        user_info, error = user.get_user_by_id({'user_id': args['user_id']})
        if error:
            response = {
                "errors": gettext('GET_USER_BY_ID_ERROR'),
                "message": error
            }
            return response, 400
        user_role, error = roles.get_role_by_id({
            'where': ['id = %s', "status NOT IN (%s)"],
            'data': [user_info['role'], 'DEL']
        })
        if error:
            response = {
                "errors": gettext('GET_ROLE_BY_ID_ERROR'),
                "message": error
            }
            return response, 400

        if user_role['label_short'] == 'superadmin':
            _args['where'] = ['status NOT IN (%s)', 'editable <> %s']
            _args['data'] = ['DEL', 'false']
        else:
            _args['where'] = ['id = ANY(%s)', 'status NOT IN (%s)', 'editable <> %s']
            _args['data'] = [user_role['assign_roles'], 'DEL', 'false']

    _roles = roles.get_roles(_args)

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
            'label_short': data['label_short'],
            'default_route': data['default_route'],
            'assign_roles': json.dumps(data['assign_roles']),
        }

        _, error = roles.update_role({'set': _set, 'role_id': role_id})

        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'update_role',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_ROLE', role=data['label'])
            })
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
        'default_route': data['default_route'],
        'assign_roles': json.dumps(data['assign_roles'])
    }

    res, error = roles.create_role({'columns': _columns})

    if error is None:
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'create_role',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_ROLE', role=data['label'])
        })
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
    role_info, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        _, error = roles.update_role({'set': {'status': 'DEL'}, 'role_id': role_id})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'delete_role',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_ROLE', role=role_info['label'])
            })
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
