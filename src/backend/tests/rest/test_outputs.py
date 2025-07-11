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


class OutputsTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', category=ResourceWarning)

    def create_ouput(self):
        payload = {
            'output_type_id': 'export_pdf',
            'output_label': 'Test export PDF',
            'compress_type': 'default',
            'ocrise': True,
            'module': 'verifier'
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/outputs/verifier/create',
                             json={"args": payload},
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_create_output(self):
        output = self.create_ouput()
        self.assertEqual(200, output.status_code)
        self.assertEqual(int, type(output.json['id']))

    def test_successful_get_outputs_list_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/verifier/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['outputs']), 5)

    def test_successful_get_outputs_list_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/splitter/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['outputs']), 6)

    def test_successful_get_outputs_types_verifier(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/verifier/getOutputsTypes',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['outputs_types']), 6)

    def test_successful_get_outputs_types_splitter(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/splitter/getOutputsTypes',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['outputs_types']), 6)

    def test_successful_get_output_type_by_id_xml(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_xml',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_output_type_by_id_pdf(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_pdf',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_output_type_by_id_mem(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_mem',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_output_type_by_id_facturx(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_facturx',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_output_type_by_id_cmis(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_cmis',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_get_output_type_by_id_openads(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/getOutputTypeById/export_openads',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_duplicate_outputs(self):
        response = self.app.post(f'/{CUSTOM_ID}/ws/outputs/verifier/duplicate/1',
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT * FROM outputs WHERE output_label ILIKE '%Copie de%' OR output_label ILIKE '%Copy of%'"
                        " ORDER BY id desc LIMIT 1")
        new_output = self.database.fetchall()
        self.assertEqual(1, len(new_output))

    def test_successful_get_output_by_id(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/outputs/verifier/getById/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))

    def test_successful_update_output(self):
        payload = {
            'output_type_id': 'export_xml',
            'compress_type': None,
            'ocrise': False,
            'output_label': 'Test export',
            'data': {
                "options": {
                    "auth": [],
                    "parameters": [
                        {
                            "id": "folder_out",
                            "type": "text",
                            "value": f"/var/share/{CUSTOM_ID}/export/verifier/"
                        },
                        {
                            "id": "separator",
                            "type": "text",
                            "value": "_"
                        },
                        {
                            "id": "filename",
                            "type": "text",
                            "value": "invoice_number#F#document_date#vat_number"
                        },
                        {
                            "id": "extension",
                            "type": "text",
                            "value": "xml"
                        }
                    ]
                }
            }
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/outputs/verifier/update/1',
                                json={"args": payload},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT * FROM outputs WHERE output_label = 'Test export'")
        new_output = self.database.fetchall()
        self.assertEqual(1, len(new_output))

    def test_successful_delete_output(self):
        output = self.create_ouput()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/outputs/verifier/delete/' + str(output.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT status FROM outputs WHERE output_label = 'Test export PDF'")
        new_output = self.database.fetchall()
        self.assertEqual('DEL', new_output[0]['status'])

    def tearDown(self) -> None:
        self.database.execute("UPDATE outputs SET output_label = 'Export XML par défaut' WHERE output_label = 'Test export'")
        self.database.execute("DELETE FROM outputs WHERE output_label ILIKE '%Copie de%' OR output_label ILIKE '%Copy of%'")
        self.database.execute("DELETE FROM outputs WHERE output_label = 'Test export PDF'")
