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

import unittest
import warnings
from src.backend import app
from base64 import b64encode
from src.backend.tests import CUSTOM_ID, get_db, get_token


class AuthTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        self.basic_auth = b64encode(b'user_ws:user_ws').decode('utf-8')
        warnings.filterwarnings('ignore', message='unclosed', category=ResourceWarning)

    def test_error_user_ws_connection(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/readConfig',
                                headers={'Content-Type': 'application/json',
                                         'Authorization': 'Basic ' + self.basic_auth})
        self.assertEqual(403, response.status_code)

    def test_successfull_user_ws_connection(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getDocservers',
                                headers={'Content-Type': 'application/json',
                                         'Authorization': 'Basic ' + self.basic_auth})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['docservers']))
