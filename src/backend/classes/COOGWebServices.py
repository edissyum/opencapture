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

import re
import json
import base64
import requests
from datetime import datetime
from flask_babel import gettext
from requests.auth import HTTPBasicAuth


class COOGWebServices:
    def __init__(self, host, token, log):
        self.log = log
        self.timeout = 10
        self.token = token
        self.base_url = re.sub("^/|/$", "", host)
        self.access_token = self.get_access_token()

    def get_access_token(self):
        try:
            args = {
                "token": self.token,
            }
            res = requests.post(self.base_url + '/auth/token', data=args, timeout=self.timeout)
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
