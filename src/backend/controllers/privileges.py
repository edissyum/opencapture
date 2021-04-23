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

from ..models import privileges


def get_user_privileges(role_id):
    privilege_info, error = privileges.get_by_role_id({
        'role_id': role_id
    })

    if error is None:
        user_privileges = privilege_info['privileges_id']['data']
        if type(eval(user_privileges)) == list:
            user_privileges = eval(user_privileges)
            if user_privileges[0] == '*':
                return '*', 200
            else:
                all_privileges = privileges.get_privileges()
                list_user_privileges = []
                for user_privilege_id in user_privileges:
                    for privilege_id in all_privileges[0]:
                        if privilege_id['id'] == user_privilege_id:
                            list_user_privileges.append(privilege_id['label'])

                return list_user_privileges, 200
    else:
        return False, False
