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

import jwt
import json
import datetime
import unittest
import warnings
from src.backend import app
from werkzeug.security import check_password_hash
from src.backend.tests import CUSTOM_ID, get_db, get_token


class UserTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
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
            "customers": [1],
            "forms": [1],
        })

        return self.app.post(f'/{CUSTOM_ID}/ws/users/new',
                             headers={"Content-Type": "application/json",
                                      'Authorization': 'Bearer ' + self.token}, data=payload)

    def test_successful_create_user(self):
        user = self.create_user()
        self.assertEqual(int, type(user.json['id']))
        self.assertEqual(200, user.status_code)

    def test_successful_delete_user(self):
        user = self.create_user()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/users/delete/' + str(user.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT status FROM users WHERE id = " + str(user.json['id']))
        new_user = self.database.fetchall()
        self.assertEqual("DEL", new_user[0]['status'])

    def test_successful_disable_user(self):
        user = self.create_user()
        response = self.app.put(f'/{CUSTOM_ID}/ws/users/disable/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT enabled FROM users WHERE id = " + str(user.json['id']))
        new_user = self.database.fetchall()
        self.assertFalse(new_user[0]['enabled'])

    def test_successful_enable_user(self):
        user = self.create_user()
        response = self.app.put(f'/{CUSTOM_ID}/ws/users/enable/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT enabled FROM users WHERE id = " + str(user.json['id']))
        new_user = self.database.fetchall()
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
        response = self.app.put(f'/{CUSTOM_ID}/ws/users/update/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

        self.database.execute("SELECT firstname, lastname, password, role, email FROM users WHERE id = " + str(user.json['id']))
        new_user = self.database.fetchall()
        self.assertEqual(1, new_user[0]['role'])
        self.assertEqual("Test", new_user[0]['firstname'])
        self.assertEqual("Test123", new_user[0]['lastname'])
        self.assertEqual("test123@tttt.fr", new_user[0]['email'])
        self.assertTrue(check_password_hash(new_user[0]['password'], 'test123'))

    def test_successful_reset_password(self):
        user = self.create_user()
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=3600),
            'iat': datetime.datetime.utcnow(),
            'sub': user.json['id']
        }
        reset_token = jwt.encode(payload, app.config['SECRET_KEY'].replace("\n", ""), algorithm='HS512')
        self.database.execute('UPDATE users SET reset_token = %s WHERE id = %s', (reset_token, user.json['id']))
        response = self.app.put(f'/{CUSTOM_ID}/ws/users/resetPassword',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'resetToken': reset_token, 'newPassword': '123465'})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.database.execute("SELECT firstname, lastname, password, role, email FROM users WHERE id = " + str(user.json['id']))
        new_user = self.database.fetchall()
        self.assertTrue(check_password_hash(new_user[0]['password'], '123465'))
        self.database.execute('UPDATE users SET reset_token = NULL WHERE id = ' + str(user.json['id']))

    def test_successful_get_users_list(self):
        self.create_user()
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 2)

    def test_successful_get_users_list_search(self):
        self.create_user()
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/list?search=Test',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 1)

    def test_successful_get_users_list_limit(self):
        self.create_user()
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/list?limit=0',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 0)

    def test_successful_get_users_list_full(self):
        self.create_user()
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/list_full',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['users']), 3)

    def test_successful_get_user_by_id(self):
        user = self.create_user()
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/getById/' + str(user.json['id']),
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
        response = self.app.get(f'/{CUSTOM_ID}/ws/users/getCustomersByUserId/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(list, type(response.json))
        self.assertEqual(response.json, [1])

    def test_successful_update_customers_by_user_id(self):
        user = self.create_user()
        payload = {"customers": [1, 2, 3]}
        response = self.app.put(f'/{CUSTOM_ID}/ws/users/customers/update/' + str(user.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json=payload)
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT customers_id FROM users_customers WHERE user_id = " + str(user.json['id']))
        new_customers = self.database.fetchall()
        self.assertEqual('[1, 2, 3]', new_customers[0]['customers_id']['data'])

    def tearDown(self) -> None:
        self.database.execute("TRUNCATE TABLE users_customers")
        self.database.execute("DELETE FROM users WHERE username = 'test'")
