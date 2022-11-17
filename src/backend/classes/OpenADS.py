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


class OpenADS:
    def __init__(self, api, login, password):
        self.api = api
        self.login = login
        self.password = password

    def test_openads_connection(self):
        try:
            res = requests.get(self.api + "/status", auth=(self.login, self.password))
            res = res.json()
            if res['msg'] != "Running":
                return {'status': True}, 401

        except Exception as e:
            response = {
                "status": False,
                "message": str(e)
            }
            return response
        return {'status': True}

    def check_folder_by_id(self, folder_id):
        try:
            res = requests.get(self.api + "/dossier/" + folder_id + "/existe", auth=(self.login, self.password))
            res = res.json()
            if 'errors' in res:
                return {'status': False, "error": res['errors'][0]['description']}

        except Exception as e:
            response = {'status': False, 'error': str(e)}
            return response

        return {'status': True}
