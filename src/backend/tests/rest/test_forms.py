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

# @dev : BRICH Oussama <oussama.brich@edissyum.com>

import json
import unittest
import warnings
from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class FormTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_splitter_form(self):
        payload = json.dumps({
            'args': {
                'module': 'splitter',
                'default_form':	False,
                'label': 'SPLITTER_TEST_FORM',
                'settings': {
                    'export_zip_file': '',
                    'metadata_method': 'metadata_default'
                }
            }
        })
        return self.app.post(f'/{CUSTOM_ID}/ws/forms/create',
                             headers={"Content-Type": "application/json",
                                      'Authorization': 'Bearer ' + self.token}, data=payload)

    def create_verifier_form(self):
        payload = json.dumps({
            "args": {
                "module": "verifier",
                "label": "VERIFIER_TEST_FORM",
                "outputs": [
                    "1"
                ],
                "default_form": True,
                "settings": {
                    "supplier_verif": True,
                    "automatic_validation_data": None,
                    "allow_automatic_validation": None,
                    "delete_documents_after_outputs": True
                }
            }
        })
        return self.app.post(f'/{CUSTOM_ID}/ws/forms/create',
                             headers={"Content-Type": "application/json",
                                      'Authorization': 'Bearer ' + self.token}, data=payload)

    def update_splitter_form_fields(self, form_id):
        payload = json.dumps({
            "batch_metadata": [{
                    'id': 'custom_5',
                    'type': 'text',
                    'settings': {},
                    'format': 'text',
                    'unit': 'custom',
                    'class': 'w-1/3',
                    'class_label': '1/33',
                    'label': 'Matricule',
                    'label_short': 'matricule',
                    'metadata_key': 'matricule',
            }],
            'document_metadata': []
        })
        return self.app.post(f'/{CUSTOM_ID}/ws/forms/updateFields/{form_id}',
                             headers={"Content-Type": "application/json",
                                      'Authorization': 'Bearer ' + self.token}, data=payload)

    def update_verifier_form_fields(self, form_id):
        payload = json.dumps({
            "supplier": [
                {
                    "id": "name",
                    "label": "ACCOUNTS.supplier_name",
                    "unit": "supplier",
                    "type": "text",
                    "required": True,
                    "required_icon": "fa-solid fa-star",
                    "class": "w-1/3",
                    "class_label": "1/33",
                    "color": "white",
                    "format": "alphanum",
                    "format_icon": "fa-solid fa-hashtag",
                    "display": "simple",
                    "display_icon": "fa-solid fa-file-alt"
                }
            ],
            "lines": [
                {
                    "id": "line_ht",
                    "label": "FACTURATION.no_rate_amount",
                    "unit": "lines",
                    "type": "text",
                    "required": True,
                    "required_icon": "fa-solid fa-star",
                    "class": "w-1/3",
                    "class_label": "1/33",
                    "format": "number_float",
                    "format_icon": "fa-solid fa-calculator",
                    "display": "simple",
                    "display_icon": "fa-solid fa-file-alt"
                }
            ],
            "facturation": [
                {
                    "id": "vat_amount",
                    "label": "FACTURATION.vat_amount",
                    "unit": "facturation",
                    "type": "text",
                    "required": True,
                    "required_icon": "fa-solid fa-star",
                    "class": "w-1/3",
                    "class_label": "1/33",
                    "color": "purple",
                    "format": "number_float",
                    "format_icon": "fa-solid fa-calculator",
                    "display": "multi",
                    "display_icon": "fa-solid fa-layer-group"
                }
            ],
            "other": []
        })

        return self.app.post(f'/{CUSTOM_ID}/ws/forms/updateFields/{form_id}',
                             headers={"Content-Type": "application/json",
                                      'Authorization': 'Bearer ' + self.token}, data=payload)

    def test_successful_create_splitter_form(self):
        form = self.create_splitter_form()
        self.assertEqual(int, type(form.json['id']))
        self.assertEqual(200, form.status_code)

    def test_successful_update_splitter_form(self):
        form = self.create_splitter_form()
        res = self.update_splitter_form_fields(form.json['id'])
        self.assertEqual(200, res.status_code)

    def test_successful_create_verifier_form(self):
        form = self.create_verifier_form()
        self.assertEqual(int, type(form.json['id']))
        self.assertEqual(200, form.status_code)

    def test_successful_update_verifier_form(self):
        form = self.create_verifier_form()
        res = self.update_verifier_form_fields(form.json['id'])
        self.assertEqual(200, res.status_code)

    def tearDown(self) -> None:
        self.db.execute("DELETE FROM form_models WHERE label = 'SPLITTER_TEST_FORM'")
        self.db.execute("DELETE FROM form_models WHERE label = 'VERIFIER_TEST_FORM'")
