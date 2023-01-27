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

# @dev : Brich Oussama <oussama.brich@edissyum.com>

import unittest
import warnings
import binascii
import base64

from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class DoctypeTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_folder(self):
        payload = {
            "code": "0.1",
            "form_id": 1,
            "type": "folder",
            "is_default": False,
            "key": "test_folder",
            "label": "Test folder",
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/doctypes/add',
                             json=payload,
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def create_doctype(self):
        payload = {
            "code": "0.1.1",
            "form_id": 1,
            "type": "document",
            "is_default": False,
            "key": "test_doctype",
            "label": "Test doctype",
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/doctypes/add',
                             json=payload,
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def update_doctype(self):
        payload = {
            "form_id": 1,
            "status": "DEL",
            "code": "0.1.1",
            "type": "document",
            "is_default": False,
            "key": "test_doctype",
            "label": "Test doctype updated"
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/doctypes/update',
                             json=payload,
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_add_doctype(self):
        doctype = self.create_doctype()
        self.assertEqual(200, doctype.status_code)

    def test_successful_add_folder(self):
        doctype = self.create_folder()
        self.assertEqual(200, doctype.status_code)

    def test_successful_get_doctypes_list(self):
        self.create_doctype()
        response = self.app.get(f'/{CUSTOM_ID}/ws/doctypes/list/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['doctypes']), 1)

    def test_generate_doctype_separator(self):
        payload = {
            "type": "docTypeSeparator",
            "key": "test_doctype",
            "label": "Test doctype updated"
        }

        response = self.app.post(f'/{CUSTOM_ID}/ws/doctypes/generateSeparator',
                                 json=payload,
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

        try:
            base64.b64decode(response.json['encoded_file'])
            base64.b64decode(response.json['encoded_thumbnail'])
            is_base64 = True
        except binascii.Error:
            is_base64 = False

        self.assertEqual(200, response.status_code)
        self.assertEqual(True, is_base64)

    def test_successful_update_doctype(self):
        response = self.update_doctype()
        self.assertEqual(200, response.status_code)

    def tearDown(self) -> None:
        self.db.execute("DELETE FROM doctypes WHERE key IN ('test_folder', 'test_doctype')")
