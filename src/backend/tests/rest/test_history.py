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


class HistoryTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', category=ResourceWarning)

    def create_history(self):
        payload = {
            'submodule': 'update_workflow',
            'module': 'verifier',
            'user_info': 'ADMIN Super (admin)',
            'desc': 'Mise à jour du workflow <b>TEST</b>',
            'user_id': 1
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/history/add', headers={"Content-Type": "application/json"}, json=payload)

    def test_successful_add_history(self):
        history = self.create_history()
        self.assertEqual(200, history.status_code)

    def test_successful_get_history_list(self):
        self.create_history()
        response = self.app.get(f'/{CUSTOM_ID}/ws/history/list?module=verifier',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['history']), 1)

    def test_successful_get_history_submodules(self):
        self.create_history()
        response = self.app.get(f'/{CUSTOM_ID}/ws/history/submodules',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['history']), 1)

    def test_successful_get_history_users(self):
        self.create_history()
        response = self.app.get(f'/{CUSTOM_ID}/ws/history/users',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['history']), 1)

    def tearDown(self) -> None:
        self.database.execute("TRUNCATE TABLE history")
