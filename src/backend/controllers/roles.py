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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import flash, g, redirect, render_template, request, url_for

from flask_babel import gettext
from ..import_controllers import pdf
from ..models import roles


def get_roles(args):
    _vars = pdf.init()
    _config = _vars[1]

    _roles = roles.get_roles(args)

    response = {
        "roles": _roles
    }
    return response, 200


def update_role(role_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    role_info, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        _set = {
            'label': data['label'],
            'label_short': data['label_short'],
            'enabled': data['enabled']
        }

        res, error = roles.update_role({'set': _set, 'role_id': role_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ROLE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_ROLE_ERROR'),
            "message": error
        }
        return response, 401


def create_role(data):
    _vars = pdf.init()
    _db = _vars[0]

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
            "message": error
        }
        return response, 401


def update_role_privilege(role_id, privileges):
    _vars = pdf.init()
    _db = _vars[0]
    user_info, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        _set = {
            'privileges_id': '{"data": "' + str(privileges) + '"}',
        }

        res, error = roles.update_role_privileges({'set': _set, 'role_id': role_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ROLE_PRIVILEGE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_ROLE_ERROR'),
            "message": error
        }
        return response, 401


def get_role_by_id(role_id):
    user_info, error = roles.get_role_by_id({'role_id': role_id})

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_ROLE_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def delete_role(role_id):
    _vars = pdf.init()
    _db = _vars[0]

    role_info, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        res, error = roles.update_role({'set': {'status': 'DEL'}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_ROLE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_ROLE_ERROR'),
            "message": error
        }
        return response, 401


def disable_role(role_id):
    _vars = pdf.init()
    _db = _vars[0]

    role_info, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        res, error = roles.update_role({'set': {'enabled': False}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_ROLE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DISABLE_ROLE_ERROR'),
            "message": error
        }
        return response, 401


def enable_role(role_id):
    _vars = pdf.init()
    _db = _vars[0]

    user_info, error = roles.get_role_by_id({'role_id': role_id})
    if error is None:
        res, error = roles.update_role({'set': {'enabled': True}, 'role_id': role_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_ROLE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('ENABLE_ROLE_ERROR'),
            "message": error
        }
        return response, 401
