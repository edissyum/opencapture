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

import os
import base64
import unittest
import warnings
from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class ConfigTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)
        warnings.filterwarnings('ignore', message="subprocess .* is still running", category=ResourceWarning)

    def test_successful_read_config(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/readConfig',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json['config'][0]))

    def test_successful_get_configurations_full(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getConfigurations',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['configurations']))

    def test_successful_get_configurations_search(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getConfigurations?search=invoiceSizeMin',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['configurations']))
        self.assertEqual(len(response.json['configurations']), 1)

    def test_successful_get_configurations_limit(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getConfigurations?limit=5',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['configurations']))
        self.assertEqual(len(response.json['configurations']), 5)

    def test_successful_get_configuration_by_label(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getConfiguration/invoiceSizeMin',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['configuration']))
        self.assertEqual(len(response.json['configuration']), 1)
        self.assertEqual(response.json['configuration'][0]['label'], 'invoiceSizeMin')

    def test_successful_get_docservers_full(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getDocservers',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['docservers']))

    def test_successful_get_docservers_search(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getDocservers?search=DOCSERVERS_PATH',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['docservers']))
        self.assertEqual(len(response.json['docservers']), 1)

    def test_successful_get_docservers_limit(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getDocservers?limit=5',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['docservers']))
        self.assertEqual(len(response.json['docservers']), 5)

    def test_successful_get_regex_full(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getRegex',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['regex']))

    def test_successful_get_regex_search(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getRegex?search=email',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['regex']))
        self.assertEqual(len(response.json['regex']), 1)

    def test_successful_get_regex_limit(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getRegex?limit=5',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(list, type(response.json['regex']))
        self.assertEqual(len(response.json['regex']), 5)

    def test_successful_update_regex(self):
        self.database.execute("SELECT id FROM regex WHERE regex_id = 'email'")
        regex_id = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/config/updateRegex/' + str(regex_id[0]['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': {"label": 'Adresse email', "content": "Updated_content"}})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT content FROM regex WHERE regex_id = 'email'")
        updated_regex = self.database.fetchall()
        self.assertEqual("Updated_content", updated_regex[0]['content'])

    def test_successful_get_login_image(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/getLoginImage',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        login_image = open('/var/www/html/opencapture/src/assets/imgs/login_image.png', 'rb')
        current_login_image = base64.b64encode(login_image.read())
        login_image.close()
        self.assertEqual(current_login_image.decode('utf-8'), response.json)

    def test_successful_update_login_image(self):
        login_image = open('/var/www/html/opencapture/src/assets/imgs/login_image.png', 'rb')
        default_login_image = base64.b64encode(login_image.read())
        login_image.close()
        response = self.app.put(f'/{CUSTOM_ID}/ws/config/updateLoginImage',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={"args": {"image_content": default_login_image.decode('utf-8')}})
        self.assertEqual(200, response.status_code)
        custom_image = open(f'/var/www/html/opencapture/custom/{CUSTOM_ID}/assets/imgs/login_image.png', 'rb')
        custom_login_image = base64.b64encode(custom_image.read())
        custom_image.close()
        self.assertEqual(default_login_image.decode('utf-8'), custom_login_image.decode('utf-8'))

    def test_successful_update_configuration(self):
        self.database.execute("SELECT id FROM configurations WHERE label = 'invoiceSizeMin'")
        configuration_id = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/config/updateConfiguration/' + str(configuration_id[0]['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={"data": {"type": "int", "value": "8",
                                               "description": "Taille minimale pour un numéro de facture"}})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT data #>> '{value}' as value FROM configurations WHERE label = 'invoiceSizeMin'")
        updated_configuration = self.database.fetchall()
        self.assertEqual("8", updated_configuration[0]['value'])

    def test_successful_update_docservers(self):
        self.database.execute("SELECT id, path, description, docserver_id FROM docservers WHERE docserver_id = "
                        "'DOCSERVERS_PATH'")
        docserver_id = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/config/updateDocserver/' + str(docserver_id[0]['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={"data": {"id": docserver_id[0]['id'], "docserver_id": "DOCSERVERS_PATH",
                                               "description": docserver_id[0]['description'], "path": "/new/path/"}})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT path FROM docservers WHERE docserver_id = 'DOCSERVERS_PATH'")
        updated_docservers = self.database.fetchall()
        self.assertEqual("/new/path/", updated_docservers[0]['path'])

    def test_successful_get_git_info(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/config/gitInfo',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

        self.assertEqual(200, response.status_code)
        self.assertEqual(str, type(response.json['git_latest']))

    def tearDown(self) -> None:
        if os.path.isfile(f'/var/www/html/opencapture/custom/{CUSTOM_ID}/assets/imgs/login_image.png'):
            os.remove(f'/var/www/html/opencapture/custom/{CUSTOM_ID}/assets/imgs/login_image.png')
        self.database.execute("UPDATE regex "
                        "SET content = '([A-Za-z0-9]+[\.\-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+' "
                        "WHERE regex_id = 'email'")
        self.database.execute(f"UPDATE docservers SET path = '/var/docservers/opencapture/{CUSTOM_ID}/' "
                        "WHERE docserver_id = 'DOCSERVERS_PATH'")
