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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import requests
from requests.auth import HTTPBasicAuth

import os
import json
from base64 import b64encode


class OpenADS:
    def __init__(self, api, login, password):
        self.api = api
        self.auth = HTTPBasicAuth(login, password)

    def test_connection(self):
        try:
            res = requests.get(self.api + "/status", auth=self.auth)
            res = res.json()
            if 'msg' in res and res['msg'] == 'Running':
                return {'status': True}

        except Exception as e:
            response = {
                "status": False,
                "message": str(e)
            }
            return response

        return {'status': False}

    def check_folder_by_id(self, folder_id):
        try:
            res = requests.get(self.api + "/dossier/" + folder_id + "/existe", auth=self.auth)
            res = res.json()

            if 'existe' in res and res['existe']:
                return {'status': True}

            elif 'existe' in res and not res['existe']:
                return {'status': False}

            elif 'status' in res and res['status'] == 'error':
                return {'status': False, "error": res['errors'][0]['description']}

        except Exception as e:
            response = {'status': False, 'error': str(e)}
            return response

        return {'status': True}

    def create_documents(self, folder_id, paths, documents):
        try:
            for index, path in enumerate(paths):
                with open(path, 'rb') as f:
                    b64 = str(b64encode(f.read()), 'utf-8')
                filename = os.path.basename(path)
                doctype = documents[index]['doctype_key'].split("-")[-1]
                data = [
                    {
                        'b64_content': b64,
                        "filename": filename,
                        "piece_type": int(doctype),
                        "content_type": "application/pdf"
                    },
                ]
                response = requests.post(self.api + "/dossier/" + folder_id + "/pieces", data=json.dumps(data), auth=self.auth)
                if 'errors' in response:
                    return {'status': False, "error": response['errors'][0]['description']}
        except Exception as e:
            response = {'status': False, 'error': str(e)}
            return response

        return {'status': True}
