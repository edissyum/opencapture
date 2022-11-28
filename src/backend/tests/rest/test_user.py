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
import unittest
import warnings
from src.backend import app
from src.backend.tests import get_db, get_token
from werkzeug.security import check_password_hash


class UserTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_user(self):
        payload = json.dumps({
            "username": "test",
            "firstname": "Test",
            "lastname": "Test",
            "password": "test",
            "email": "test@test.fr",
            "role": "2",
            "customers": [1]
        })

        return self.app.post('/test/ws/users/new', headers={"Content-Type": "application/json"}, data=payload)

    def test_successful_create_user(self):
        user = self.create_user()
        self.assertEqual(int, type(user.json['id']))
        self.assertEqual(200, user.status_code)

    def test_successful_delete_user(self):
        user = self.create_user()
        response = self.app.delete('/test/ws/users/delete/' + str(user.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT status FROM users WHERE id = " + str(user.json['id']))
        new_user = self.db.fetchall()
        self.assertEqual("DEL", new_user[0]['status'])

    def test_successful_disable_user(self):
        user = self.create_user()
        response = self.app.put('/test/ws/users/disable/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT enabled FROM users WHERE id = " + str(user.json['id']))
        new_user = self.db.fetchall()
        self.assertFalse(new_user[0]['enabled'])

    def test_successful_enable_user(self):
        user = self.create_user()
        response = self.app.put('/test/ws/users/enable/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT enabled FROM users WHERE id = " + str(user.json['id']))
        new_user = self.db.fetchall()
        self.assertTrue(new_user[0]['enabled'])

    def test_successful_update_user(self):
        user = self.create_user()
        payload = {
            "firstname": "Test",
            "lastname": "Test123",
            "password": "test123",
            "email": "test123@tttt.fr",
            "role": "1",
        }
        response = self.app.put('/test/ws/users/update/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

        self.db.execute("SELECT firstname, lastname, password, role, email FROM users WHERE id = " + str(user.json['id']))
        new_user = self.db.fetchall()
        self.assertEqual(1, new_user[0]['role'])
        self.assertEqual("Test", new_user[0]['firstname'])
        self.assertEqual("Test123", new_user[0]['lastname'])
        self.assertEqual("test123@tttt.fr", new_user[0]['email'])
        self.assertTrue(check_password_hash(new_user[0]['password'], 'test123'))

    def test_successful_get_users_list(self):
        self.create_user()
        response = self.app.get('/test/ws/users/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 1)

    def test_successful_get_users_list_search(self):
        self.create_user()
        response = self.app.get('/test/ws/users/list?search=Test',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 1)

    def test_successful_get_users_list_limit(self):
        self.create_user()
        response = self.app.get('/test/ws/users/list?limit=0',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 0)

    def test_successful_get_users_list_full(self):
        self.create_user()
        response = self.app.get('/test/ws/users/list_full',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 2)

    def test_successful_get_user_by_id(self):
        user = self.create_user()
        response = self.app.get('/test/ws/users/getById/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertTrue(response.json['enabled'])
        self.assertEqual(2, response.json['role'])
        self.assertEqual('OK', response.json['status'])
        self.assertEqual('test', response.json['username'])
        self.assertEqual('Test', response.json['lastname'])
        self.assertEqual('Test', response.json['firstname'])

    def test_successful_get_customers_by_user_id(self):
        user = self.create_user()
        response = self.app.get('/test/ws/users/getCustomersByUserId/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(list, type(response.json))
        self.assertEqual(response.json, [1])

    def test_successful_update_customers_by_user_id(self):
        user = self.create_user()
        payload = {"customers": [1, 2, 3]}
        response = self.app.put('/test/ws/users/customers/update/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json=payload)
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT customers_id FROM users_customers WHERE user_id = " + str(user.json['id']))
        new_customers = self.db.fetchall()
        self.assertEqual('[1, 2, 3]', new_customers[0]['customers_id']['data'])

    def tearDown(self) -> None:
        self.db.execute("TRUNCATE TABLE users_customers")
        self.db.execute("DELETE FROM users WHERE username = 'test'")
