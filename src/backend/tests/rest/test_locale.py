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
from src.backend.tests import CUSTOM_ID, get_db, get_token


class LocaleTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def test_successful_change_language(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/i18n/changeLanguage/eng',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.db.execute("SELECT data #>> '{value}' as value FROM configurations WHERE label = 'locale'")
        new_configuration = self.db.fetchall()
        self.assertEqual('eng', new_configuration[0]['value'])

    def test_successful_get_all_lang(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/i18n/getAllLang',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['langs']))
        self.assertGreaterEqual(2, len(response.json['langs']))

    def test_successful_get_current_lang(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/i18n/getCurrentLang',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual('fr', response.json['babel_lang'])
        self.assertEqual('fra', response.json['lang'])
        self.assertEqual('fr-FR', response.json['moment_lang'])

    def tearDown(self) -> None:
        self.db.execute('UPDATE configurations '
                        'SET data = \'{"type": "string", "value": "fra", "description": "Clé pour la sélection de la '
                        'langue (fra ou eng par défaut)"}\' '
                        'WHERE label = \'locale\' ')
