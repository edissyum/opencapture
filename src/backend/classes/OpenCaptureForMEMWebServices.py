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

import re
import json
import requests
from flask_babel import gettext


class OpenCaptureForMEMWebServices:
    def __init__(self, host, secret_key, custom_id, log):
        self.log = log
        self.timeout = 10
        self.secret_key = secret_key
        self.custom_id = custom_id
        self.base_url = re.sub("^/|/$", "", host)
        self.headers = {'Content-Type': 'application/json'}
        self.access_token = self.get_access_token()

    def get_access_token(self):
        try:
            args = {
                "secret_key": self.secret_key,
                "custom_id": self.custom_id
            }
            res = requests.post(self.base_url + '/get_token', headers=self.headers, data=json.dumps(args),
                                timeout=self.timeout)
            if res.text:
                if res.status_code >= 404:
                    return [False, gettext('HOST_NOT_FOUND_OR_OTHER_ERROR')]
                if 'message' in json.loads(res.text):
                    return [False, json.loads(res.text)['message']]
            if res.status_code == 200 and 'token' in json.loads(res.text):
                access_token = json.loads(res.text)['token']
                return [True, access_token]
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout,
                requests.exceptions.MissingSchema, json.decoder.JSONDecodeError) as request_error:
            self.log.error('Error connecting to the host. Exiting program..', False)
            self.log.error('More information : ' + str(request_error), False)
            return [False, str(request_error)]


    def get_processes(self):
        bearer = "Bearer " + self.access_token[1]
        self.headers['Authorization'] = bearer

        args = json.dumps({'custom_id': self.custom_id})
        res = requests.post(self.base_url + '/get_process_list', data=args, headers=self.headers, timeout=self.timeout)
        if res.status_code != 200 and res.status_code != 201:
            self.log.error('(' + str(res.status_code) + ') getProcessesError : ' + str(res.text))
            return res.text
        return json.loads(res.text)


    def send_documents(self, files, output):
        bearer = "Bearer " + self.access_token[1]
        self.headers['Authorization'] = bearer
        args = json.dumps({
            'files': files,
            'custom_id': self.custom_id,
            'process_name': output['process'],
            'custom_fields': output['custom_fields'],
            'destination': output['destination'] if output['destination'] else None,
            'read_destination_from_filename': True if output['rdff'].lower() == 'true' else False
        })

        res = requests.post(self.base_url + '/upload', data=args, headers=self.headers, timeout=self.timeout)
        if res.status_code != 200 and res.status_code != 201:
            self.log.error('(' + str(res.status_code) + ') uploadError : ' + str(res.text))
            return res.text, res.status_code
        return json.loads(res.text), 200
