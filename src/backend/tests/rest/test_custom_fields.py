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
from src.backend.tests import CUSTOM_ID, get_db, get_token


class CustomFieldsTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_custom(self):
        payload = {
            'type': 'text',
            'label': 'Test custom',
            'module': 'verifier',
            'label_short': 'test_custom_verifier',
            'metadata_key': ''
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/customFields/add',
                             json=payload,
                             headers={"Content-Type": "application/json",  'Authorization': 'Bearer ' + self.token})

    def test_successful_add_custom_fields(self):
        custom = self.create_custom()
        self.assertEqual(200, custom.status_code)
        self.assertEqual(int, type(custom.json['id']))

    def test_successful_get_custom_fields_list_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/customFields/list?module=splitter',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['customFields']), 5)

    def test_successful_get_custom_fields_list_verifier(self):
        self.create_custom()
        response = self.app.get(f'/{CUSTOM_ID}/ws/customFields/list?module=verifier',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['customFields']), 1)

    def test_successful_update_custom_fields(self):
        custom = self.create_custom()
        response = self.app.put(f'/{CUSTOM_ID}/ws/customFields/update',
                                data=json.dumps({
                                    'id': custom.json['id'],
                                    'label': 'Labelled updated',
                                    'label_short': 'test_custom_verifier',
                                    'type': 'select',
                                    'module': 'verifier',
                                    'enabled': True,
                                    'metadata_key': ''
                                }),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT label, type  FROM custom_fields WHERE label_short = 'test_custom_verifier'")
        new_custom = self.database.fetchall()
        self.assertEqual('select', new_custom[0]['type'])
        self.assertEqual('Labelled updated', new_custom[0]['label'])

    def test_successful_delete_custom_fields(self):
        custom = self.create_custom()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/customFields/delete/' + str(custom.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT status  FROM custom_fields WHERE label_short = 'test_custom_verifier'")
        new_custom = self.database.fetchall()
        self.assertEqual('DEL', new_custom[0]['status'])

    def tearDown(self) -> None:
        self.database.execute("DELETE FROM custom_fields WHERE module = 'verifier'")
