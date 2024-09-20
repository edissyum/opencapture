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
import re
import json
import requests
from flask_babel import gettext


class COOGWebServices:
    def __init__(self, host, token, cert_path, log):
        self.log = log
        self.timeout = 10
        self.token = token
        self.cert_path = None
        if cert_path and os.path.isfile(cert_path):
            self.cert_path = cert_path
        self.base_url = re.sub("^/|/$", "", host)
        self.access_token = self.get_access_token()

    def get_access_token(self):
        try:
            args = {
                "token": self.token
            }
            res = requests.post(self.base_url + '/auth/token', data=args, timeout=self.timeout, verify=self.cert_path)
            if res.text:
                if res.status_code == 404:
                    return [False, gettext('HOST_NOT_FOUND')]
                if 'errors' in json.loads(res.text):
                    return [False, json.loads(res.text)['errors'][0]['message']]
            if res.status_code == 200 and 'access_token' in json.loads(res.text):
                access_token = json.loads(res.text)['access_token']
                return [True, access_token]
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout,
                requests.exceptions.MissingSchema) as request_error:
            self.log.error('Error connecting to the host. Exiting program..', False)
            self.log.error('More information : ' + str(request_error), False)
            return [False, str(request_error)]

    def create_task(self, task):
        bearer = "Bearer " + self.access_token[1]
        headers = {
            "Content-Type": "application/json",
            "Authorization": bearer
        }
        res = requests.post(self.base_url + '/api/v2/tasks/actions/create', data=json.dumps(task), headers=headers,
                            timeout=self.timeout, verify=self.cert_path)
        if res.status_code != 200 and res.status_code != 201:
            self.log.error('(' + str(res.status_code) + ') createTaskError : ' + str(res.text))
            return_message = res.text
            if 'error' in res.json():
                error_name = res.json()['error'][0]['name']
                error_message = res.json()['error'][0]['message']

                return_message = '<b>' + error_name + '</b> : \n ' + error_message
            return False, return_message
        return True, json.loads(res.text)


    def create_attachment(self, args):
        bearer = "Bearer " + self.access_token[1]
        headers = {
            "Content-Type": "application/json",
            "Authorization": bearer
        }
        res = requests.post(self.base_url + '/api/v2/tasks/actions/create-attachments',
                            data=json.dumps(args), headers=headers, timeout=self.timeout, verify=self.cert_path)
        if res.status_code != 200 and res.status_code != 201:
            self.log.error('(' + str(res.status_code) + ') createAttachmentError : ' + str(res.text))
            return False, res.text
        return True, json.loads(res.text)
