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

import os.path
import unittest
import warnings
from src.backend import app
from configparser import ConfigParser
from src.backend.tests import CUSTOM_ID, get_db, get_token


class InputsTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_input(self):
        payload = {
            'module': 'verifier',
            'input_id': 'test_input',
            'input_label': 'Test Input',
            'input_folder': '/var/share/test/entrant/verifier/new_folder/',
            'default_form_id': 1,
            'customer_id': None,
            'splitter_method_id': False,
            'remove_blank_pages': False,
            'override_supplier_form': False,
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/inputs/create',
                             json={"args": payload},
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_create_intput(self):
        _input = self.create_input()
        self.assertEqual(200, _input.status_code)
        self.assertEqual(int, type(_input.json['id']))

    def test_successful_get_inputs_list_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/inputs/list?module=verifier',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['inputs']), 1)

    def test_successful_get_inputs_list_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/inputs/list?module=splitter',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['inputs']), 1)

    def test_successful_get_input_by_id_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/inputs/getById/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_input_by_id_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/inputs/getById/2',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_input_by_form_id(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/inputs/getByFormId/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(list, type(response.json))
        self.assertEqual(1, len(response.json))

    def test_successful_duplicate_input(self):
        response = self.app.post(f'/{CUSTOM_ID}/ws/inputs/duplicate/1',
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT * FROM inputs WHERE input_label ILIKE '%Copie de%' OR input_label ILIKE '%Copy of%'"
                        " ORDER BY id desc LIMIT 1")
        new_input = self.db.fetchall()
        self.assertEqual(1, len(new_input))

    def test_successful_update_input(self):
        payload = {
            "input_label": "Updated test input",
            "default_form_id": 2,
            "input_folder": "/var/share/test/entrant/verifier/new_input_folder/",
            "splitter_method_id": "no_sep"
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/inputs/update/1',
                                json={"args": payload},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT * FROM inputs WHERE input_label = 'Updated test input'")
        new_input = self.db.fetchall()
        self.assertEqual(1, len(new_input))

    def test_successful_delete_input(self):
        _input = self.create_input()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/inputs/delete/' + str(_input.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT status FROM inputs WHERE input_label = 'Test Input'")
        new_input = self.db.fetchall()
        self.assertEqual('DEL', new_input[0]['status'])

    def test_successful_create_script_incron(self):
        self.create_input()
        payload = {
            'module': 'verifier',
            'input_id': 'test_input',
            'input_label': 'Test Input',
            'input_folder': '/var/share/test/entrant/verifier/new_folderaaaa/',
            'default_form_id': 1,
            'customer_id': None,
            'splitter_method_id': False,
            'remove_blank_pages': False,
            'override_supplier_form': False,
        }
        response = self.app.post(f'/{CUSTOM_ID}/ws/inputs/createScriptAndIncron', json={"args": payload},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertTrue(os.path.isfile('./custom/test/bin/scripts//verifier_inputs//test_input.sh'))
        config = ConfigParser(allow_no_value=True)
        config.read('instance/config/watcher.ini')
        self.assertTrue('verifier_test_input_test' in config)

    def tearDown(self) -> None:
        self.db.execute("UPDATE inputs SET default_form_id = 1 WHERE input_label = 'Updated test input'")
        self.db.execute(
            "UPDATE inputs SET input_label = 'Chaîne entrante par défaut' WHERE input_label = 'Updated test input'")
        self.db.execute("DELETE FROM inputs WHERE input_label = 'Test Input'")
        self.db.execute("DELETE FROM inputs WHERE input_label ILIKE '%Copie de%' OR input_label ILIKE '%Copy of%'")
