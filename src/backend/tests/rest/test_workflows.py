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


class WorkflowsTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_workflow(self):
        payload = {
            'module': 'verifier',
            'workflow_id': 'test_workflow',
            'label': 'Test Workflow',
            'input': {
                'input_folder': f'/var/share/{CUSTOM_ID}/entrant/verifier/new_folder/',
            },
            'process': {},
            'separation': {},
            'output': {},
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/workflows/verifier/create',
                             json={"args": payload},
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_create_workflow(self):
        _workflow = self.create_workflow()
        self.assertEqual(200, _workflow.status_code)
        self.assertEqual(int, type(_workflow.json['id']))

    def test_successful_get_workflow_list_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/workflows/verifier/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['workflows']), 2)

    def test_successful_get_workflow_list_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/workflows/splitter/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['workflows']), 1)

    def test_successful_get_workflow_by_id_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/workflows/verifier/getById/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_workflow_by_id_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/workflows/splitter/getById/2',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_duplicate_workflow(self):
        response = self.app.post(f'/{CUSTOM_ID}/ws/workflows/verifier/duplicate/1',
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT * FROM workflows WHERE label ILIKE '%Copie de%' OR label ILIKE '%Copy of%'"
                        " ORDER BY id desc LIMIT 1")
        new_workflow = self.db.fetchall()
        self.assertEqual(1, len(new_workflow))

    def test_successful_update_workflow(self):
        payload = {
            "label": "Updated test workflow",
            "input": {
                "ai_model_id": None,
                "customer_id": None,
                "facturx_only": False,
                "apply_process": True,
                "input_folder": f"/var/share/{CUSTOM_ID}/entrant/verifier/new_workflow_folder/",
            }
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/workflows/verifier/update/1',
                                json={"args": payload},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT * FROM workflows WHERE label = 'Updated test workflow'")
        new_workflow = self.db.fetchall()
        self.assertEqual(1, len(new_workflow))

    def test_successful_delete_workflow(self):
        _workflow = self.create_workflow()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/workflows/verifier/delete/' + str(_workflow.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT status FROM workflows WHERE label = 'Test Workflow'")
        new_workflow = self.db.fetchall()
        self.assertEqual('DEL', new_workflow[0]['status'])

    def tearDown(self) -> None:
        self.db.execute(
            "UPDATE workflows SET label = 'Workflow par défaut' WHERE label = 'Updated test workflow'")
        self.db.execute("DELETE FROM workflows WHERE label = 'Test Workflow'")
        self.db.execute("DELETE FROM workflows WHERE label ILIKE '%Copie de%' OR label ILIKE '%Copy of%'")
