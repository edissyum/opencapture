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

import os
import re
import json
import requests
from flask_babel import gettext


class OpenCRMWebServices:
    def __init__(self, host, client_id, client_secret, log):
        self.log = log
        self.timeout = 10
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = re.sub("^/|/$", "", host)
        self.access_token = self.get_access_token()

    def get_access_token(self):
        try:
            args = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
            res = requests.post(self.base_url + '/access_token', data=args, timeout=self.timeout)
            if res.text:
                if res.status_code == 404:
                    return [False, gettext('HOST_NOT_FOUND')]
                if res.status_code >= 500:
                    return [False, gettext('SERVER_ERROR')]
                if 'errors' in json.loads(res.text):
                    return [False, json.loads(res.text)['errors'][0]['message']]
            if res.status_code == 200 and 'access_token' in json.loads(res.text):
                access_token = json.loads(res.text)['access_token']
                return [True, access_token]
            return [False, gettext('SERVER_ERROR')]
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout,
                requests.exceptions.MissingSchema) as request_error:
            self.log.error('Error connecting to the host. Exiting program..', False)
            self.log.error('More information : ' + str(request_error), False)
            return [False, str(request_error)]

    def create_entry(self, entry):
        bearer = "Bearer " + self.access_token[1]
        headers = {
            "Content-Type": "application/json",
            "Authorization": bearer
        }

        res = requests.post(self.base_url + '/V8/custom/traitement-set', data=json.dumps(entry), headers=headers,
                            timeout=self.timeout)
        if res.status_code != 200 and res.status_code != 201:
            self.log.error('(' + str(res.status_code) + ') createEntryError : ' + str(res.text))
            if 'errors' in res.json():
                return False, res.json()['errors']['details']
            return False, res.text
        return True, json.loads(res.text)