# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import json
import base64
import requests
from flask import flash
from datetime import datetime
from flask_babel import gettext
from requests.auth import HTTPBasicAuth


class MaarchWebServices:
    def __init__(self, host, user, pwd, log, config):
        self.baseUrl = host
        self.auth = HTTPBasicAuth(user, pwd)
        self.Log = log
        self.Config = config
        self.status = self.check_connection()

    def check_connection(self):
        try:
            res = requests.get(self.baseUrl + '/priorities', auth=self.auth)
            if res.text:
                if res.status_code == 404:
                    return [False, gettext('HOST_NOT_FOUND')]
                if 'errors' in json.loads(res.text):
                    return [False, json.loads(res.text)['errors']]
            return True
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.MissingSchema) as e:
            self.Log.error('Error connecting to the host. Exiting program..')
            self.Log.error('More information : ' + str(e))
            return [False, str(e)]

    def retrieve_users(self):
        res = requests.get(self.baseUrl + '/users', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getUsersError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def retrieve_entities(self):
        res = requests.get(self.baseUrl + '/entities', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getEntitiesError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def retrieve_priorities(self):
        res = requests.get(self.baseUrl + '/priorities', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getPrioritiesError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def retrieve_statuses(self):
        res = requests.get(self.baseUrl + '/statuses', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getStatusesError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def retrieve_indexing_models(self):
        res = requests.get(self.baseUrl + '/indexingModels', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getIndexinModelsError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def retrieve_doctypes(self):
        res = requests.get(self.baseUrl + '/doctypes/types', auth=self.auth)
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getDoctypesError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def insert_with_args(self, args):
        if 'contact 'not in args:
            contact = {}
        else:
            contact = [{'id': args['contact']['id'], 'type': 'contact'}]

        data = {
            'encodedFile': base64.b64encode(args['fileContent']).decode('utf-8'),
            'priority': args['priority'],
            'status': args['status'],
            'doctype': args['typeId'],
            'format': args['format'],
            'modelId': args['modelId'],
            'typist': args['typist'],
            'subject': args['subject'],
            'destination': args['destination'],
            'senders': contact,
            'documentDate': args['documentDate'],
            'chrono': True,
            'arrivaldate': str(datetime.now()),
            'customFields': args['customFields'] if 'customFields' in args else {},
        }

        if 'destUser' in args:
            data['diffusionList'] = [{
                'mode': 'dest',
                'type': 'user',
                'id': args['destUser'],
            }]

        res = requests.post(self.baseUrl + 'resources', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertIntoMaarchError : ' + str(res.text))
            return False, json.loads(res.text)
        else:
            return True, json.loads(res.text)

    def insert_attachment(self, file_content, config, res_id, _process):
        data = {
            'resId': res_id,
            'status': config.cfg[_process]['status'],
            'collId': 'letterbox_coll',
            'table': 'res_attachments',
            'data': [
                {'column': 'title', 'value': 'Rapprochement note interne', 'type': 'string'},
                {'column': 'attachment_type', 'value': config.cfg[_process]['attachment_type'], 'type': 'string'},
                {'column': 'coll_id', 'value': 'letterbox_coll', 'type': 'string'},
                {'column': 'res_id_master', 'value': res_id, 'type': 'string'}
            ],
            'encodedFile': base64.b64encode(file_content).decode('utf-8'),
            'fileFormat': config.cfg[_process]['format'],
        }

        res = requests.post(self.baseUrl + 'attachments', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertAttachmentsIntoMaarchError : ' + str(res.text))
            return False
        else:
            return res.text

    def retrieve_contact_by_vat_number(self, vat):
        res = requests.get(self.baseUrl + 'getContactByVAT', auth=self.auth, params={'VAT': vat})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') GetContactByVATError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def create_contact(self, contact):
        res = requests.post(self.baseUrl + '/contacts', auth=self.auth, data=json.dumps(contact),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') CreateContactError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)
