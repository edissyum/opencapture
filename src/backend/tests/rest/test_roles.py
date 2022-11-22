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
import warnings
import unittest
from src.backend import app
from src.backend.tests import get_db, get_token


class RolesTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_role(self):
        payload = json.dumps({
            "args": {
                "label_short": "TEST",
                "label": "Rôle test",
            }
        })

        return self.app.post('/test/ws/roles/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             data=payload)

    def test_successful_new_role(self):
        role = self.create_role()
        self.assertEqual(int, type(role.json['id']))
        self.assertEqual(200, role.status_code)

    def test_successful_delete_role(self):
        role = self.create_role()
        response = self.app.delete('/test/ws/roles/delete/' + str(role.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT status FROM roles WHERE id = " + str(role.json['id']))
        new_role = self.db.fetchall()
        self.assertEqual("DEL", new_role[0]['status'])

    def test_successful_disable_role(self):
        role = self.create_role()
        response = self.app.put('/test/ws/roles/disable/' + str(role.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT enabled FROM roles WHERE id = " + str(role.json['id']))
        new_role = self.db.fetchall()
        self.assertFalse(new_role[0]['enabled'])

    def test_successful_enable_role(self):
        role = self.create_role()
        response = self.app.put('/test/ws/roles/enable/' + str(role.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT enabled FROM roles WHERE id = " + str(role.json['id']))
        new_role = self.db.fetchall()
        self.assertTrue(new_role[0]['enabled'])

    def test_successful_update_role(self):
        role = self.create_role()
        payload = {
            "label": "Rôle test updated",
            "label_short": "TEST123",
            "enabled": False
        }
        response = self.app.put('/test/ws/roles/update/' + str(role.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT label, label_short, enabled FROM roles WHERE id = " + str(role.json['id']))
        new_role = self.db.fetchall()
        self.assertEqual("TEST123", new_role[0]['label_short'])
        self.assertEqual("Rôle test updated", new_role[0]['label'])
        self.assertFalse(new_role[0]['enabled'])

    def test_successful_update_role_privilege(self):
        role = self.create_role()
        payload = [1, 2, 3]
        response = self.app.put('/test/ws/roles/updatePrivilege/' + str(role.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'privileges': payload})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT privileges_id FROM roles_privileges WHERE role_id = " + str(role.json['id']))
        new_role_privileges = self.db.fetchall()
        self.assertEqual('[1, 2, 3]', new_role_privileges[0]['privileges_id']['data'])

    def test_successful_get_roles(self):
        response = self.app.get('/test/ws/roles/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['roles']), 2)

    def test_successful_get_role_by_id(self):
        role = self.create_role()
        response = self.app.get('/test/ws/roles/getById/' + str(role.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual('TEST', response.json['label_short'])
        self.assertEqual('Rôle test', response.json['label'])
        self.assertEqual('OK', response.json['status'])
        self.assertTrue(response.json['editable'])
        self.assertTrue(response.json['enabled'])

    def tearDown(self):
        self.db.execute("TRUNCATE TABLE roles_privileges")
        self.db.execute("DELETE FROM roles WHERE label_short = 'TEST'")
        self.db.execute("DELETE FROM roles WHERE label_short = 'TEST123'")
