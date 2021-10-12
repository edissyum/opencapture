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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
from flask_babel import gettext
from src.backend.import_models import privileges


def get_privileges():
    all_privileges, error = privileges.get_privileges()

    if error is None:
        list_role_privileges = {
            'parent': [],
            'privileges': []
        }
        for privilege_id in all_privileges:
            if privilege_id['parent'] not in list_role_privileges['parent']:
                list_role_privileges['parent'].append(privilege_id['parent'])
            list_role_privileges['privileges'].append({'id': privilege_id['id'], 'label': privilege_id['label'], 'parent': privilege_id['parent']})
        return list_role_privileges, 200
    else:
        response = {
            "errors": gettext('GET_PRIVILEGES_ERROR'),
            "message": error
        }
        return response, 401


def get_privileges_by_role_id(args):
    privilege_info, error = privileges.get_by_role_id({
        'role_id': args['role_id']
    })

    if error is None:
        role_privileges = privilege_info['privileges_id']['data']
        if type(eval(role_privileges)) == list:
            role_privileges = eval(role_privileges)
            if role_privileges and role_privileges[0] == '*':
                return '*', 200
            else:
                all_privileges, error = privileges.get_privileges()
                list_role_privileges = []
                for role_privilege_id in role_privileges:
                    for privilege_id in all_privileges:
                        if privilege_id['id'] == role_privilege_id:
                            list_role_privileges.append(privilege_id['label'])

                return list_role_privileges, 200
    else:
        response = {
            "errors": gettext('GET_PRIVILEGES_ERROR'),
            "message": error
        }
        return response, 401
