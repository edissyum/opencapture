# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import unittest
import warnings
from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class WorkflowsTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', category=ResourceWarning)

    def create_workflow(self):
        payload = {
            'module': 'verifier',
            'label': 'Test Workflow',
            'workflow_id': 'test_workflow',
            'input': {
                'rotation': 'no_rotation',
                'remove_blank_pages': False,
                'splitter_method_id': 'no_sep',
                'input_folder': f'/var/share/{CUSTOM_ID}/entrant/verifier/new_folder/'
            },
            'process': {
                "form_id": 1,
                "custom_fields": [],
                "system_fields": ["name", "invoice_number", "quotation_number", "document_date", "footer"],
                "use_interface": True,
                "delete_documents": False,
                "override_supplier_form": False,
                "allow_automatic_validation": True
            },
            'output': {
                "outputs_id": [3]
            }
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
        self.assertEqual(len(response.json['workflows']), 4)

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
        data = {
            "workflow_id": 1,
            "workflow_label_short": "copy_default_worklow"
        }
        response = self.app.post(f'/{CUSTOM_ID}/ws/workflows/verifier/duplicate', json=data,
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT * FROM workflows WHERE label ILIKE '%Copie de%' OR label ILIKE '%Copy of%'"
                        " ORDER BY id desc LIMIT 1")
        new_workflow = self.database.fetchall()
        self.assertEqual(1, len(new_workflow))

    def test_successful_update_workflow(self):
        payload = {
            "module": "verifier",
            "workflow_id": "default_workflow",
            "label": "Updated test workflow",
            "input": {
                "rotation": "no_rotation",
                "ai_model_id": None,
                "customer_id": None,
                "facturx_only": False,
                "apply_process": True,
                "remove_blank_pages": False,
                "splitter_method_id": "no_sep",
                "input_folder": f"/var/share/{CUSTOM_ID}/entrant/verifier/new_workflow_folder/"
            }
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/workflows/verifier/update/1',
                                json={"args": payload},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT * FROM workflows WHERE label = 'Updated test workflow'")
        new_workflow = self.database.fetchall()
        self.assertEqual(1, len(new_workflow))

    def test_successful_delete_workflow(self):
        _workflow = self.create_workflow()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/workflows/verifier/delete/' + str(_workflow.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT status FROM workflows WHERE label = 'Test Workflow'")
        new_workflow = self.database.fetchall()
        self.assertEqual('DEL', new_workflow[0]['status'])

    def tearDown(self) -> None:
        self.database.execute(
            "UPDATE workflows SET label = 'Workflow par défaut' WHERE label = 'Updated test workflow'")
        self.database.execute("DELETE FROM workflows WHERE label = 'Test Workflow'")
        self.database.execute("DELETE FROM workflows WHERE label ILIKE '%Copie de%' OR label ILIKE '%Copy of%'")
