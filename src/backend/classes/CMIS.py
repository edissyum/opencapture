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

# @dev : Nathan CHEVAL <nathan.cheval@edissyum.com>

import requests
from unidecode import unidecode
from requests.auth import HTTPBasicAuth

class CMIS:
    def __init__(self, repository_url, cmis_username, cmis_password, base_dir):
        self.base_dir = base_dir
        self.cmis_username = cmis_username
        self.cmis_password = cmis_password
        self.repository_url = repository_url
        self.cmis_client = self.cmis_request('GET', self.repository_url)

        root_request = self.cmis_request('GET', f'{self.repository_url}/root/{self.base_dir}?cmisselector=object')
        if root_request.status_code == 200:
            root_folder = root_request.json()
            if 'properties' in root_folder and 'cmis:path' in root_folder['properties']:
                self.root_folder = root_folder['properties']['cmis:path']['value']
        else:
            self.root_folder = None


    def cmis_request(self, method, url, data=None, files=None):
        headers = {
            'User-Agent': 'cmislib/%s +http://chemistry.apache.org/'
        }
        auth = HTTPBasicAuth(self.cmis_username, self.cmis_password)
        response = requests.request(method, url, verify=False, headers=headers, data=data, files=files, auth=auth)
        return response


    def create_document(self, path, content_type):
        try:
            filename = path.split('/')[-1]
            data = {
                'propertyId[0]': 'cmis:objectTypeId',
                'propertyValue[0]': 'cmis:document',
                'propertyId[1]': 'cmis:name',
                'propertyValue[1]': filename
            }
            files = [
                ('file', (filename, open(path, 'rb'), content_type))
            ]

            url = f'{self.repository_url}/root/{self.base_dir}?cmisaction=createDocument'
            response = self.cmis_request('POST', url, data=data, files=files)
            if response.status_code == 201:
                return True, ''
            else:
                return False, unidecode(response.text)
        except (Exception,) as e:
            return False, str(e)
