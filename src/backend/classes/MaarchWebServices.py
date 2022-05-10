# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import json
import base64
from datetime import datetime
import requests
from flask_babel import gettext
from requests.auth import HTTPBasicAuth


class MaarchWebServices:
    def __init__(self, host, user, pwd, log, config):
        self.base_url = host + '/'
        self.auth = HTTPBasicAuth(user, pwd)
        self.log = log
        self.config = config
        self.status = self.check_connection()

    def check_connection(self):
        try:
            res = requests.get(self.base_url + '/priorities', auth=self.auth)
            if res.text:
                if res.status_code == 404:
                    return [False, gettext('HOST_NOT_FOUND')]
                if 'errors' in json.loads(res.text):
                    return [False, json.loads(res.text)['errors']]
            return [True, '']
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.MissingSchema) as request_error:
            self.log.error('Error connecting to the host. Exiting program..', False)
            self.log.error('More information : ' + str(request_error), False)
            return [False, str(request_error)]

    def retrieve_users(self):
        res = requests.get(self.base_url + '/users', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getUsersError : ' + str(res.text))
        return json.loads(res.text), res.status_code

    def retrieve_entities(self):
        res = requests.get(self.base_url + '/entities', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getEntitiesError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_custom_fields(self):
        res = requests.get(self.base_url + '/customFields', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getCustomFieldsError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_contact_custom_fields(self):
        res = requests.get(self.base_url + '/contactsCustomFields', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getContactCustomFieldsError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_contact(self, args):
        where = "where=custom_fields->>'" + str(args['vatNumberContactCustom']['id']) + "'='" + str(args['supplierCustomId']) + "'"
        res = requests.get(self.base_url + '/contacts?' + where, auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getContactError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def get_document_with_contact(self, args):
        where = "?custom_fields=" + str(args['maarchCustomField']['id'])
        res = requests.get(self.base_url + '/resources/getByContact/' + args['contactId'] + where, auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getContactError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_priorities(self):
        res = requests.get(self.base_url + '/priorities', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getPrioritiesError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_priority(self, priority):
        res = requests.get(self.base_url + '/priorities/' + priority, auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getPriorityByIdError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_doc_with_custom(self, custom_id, data, clause):
        data = {
            'select': 'res_id',
            'clause': clause + " AND custom_fields ->> '" + str(custom_id) + "' = '" + str(data) + "'"
        }

        res = requests.post(self.base_url + '/res/list', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getDocumentWithCustomField : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_statuses(self):
        res = requests.get(self.base_url + '/statuses', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getStatusesError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_indexing_models(self):
        res = requests.get(self.base_url + '/indexingModels', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getIndexinModelsError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def retrieve_doctypes(self):
        res = requests.get(self.base_url + '/doctypes/types', auth=self.auth)
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') getDoctypesError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def link_documents(self, res_id_master, res_id):
        data = {
            'linkedResources': [res_id]
        }
        res = requests.post(self.base_url + '/resources/' + res_id_master + '/linkedResources', auth=self.auth,
                            data=json.dumps(data), headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') linkDocumentError : ' + str(res.text))
            return False
        return json.loads(res.text)

    def insert_with_args(self, args):
        if 'contact' not in args:
            contact = {}
        else:
            contact = [{'id': args['contact']['id'], 'type': 'contact'}]

        today = datetime.today().strftime('%Y-%m-%d')

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
            'processLimitDate': args['processLimitDate'],
            'chrono': True,
            'arrivalDate': str(today),
            'customFields': args['customFields'] if 'customFields' in args else {},
        }

        if 'destUser' in args:
            data['diffusionList'] = [{
                'mode': 'dest',
                'type': 'user',
                'id': args['destUser'],
            }]

        res = requests.post(self.base_url + 'resources', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') InsertIntoMaarchError : ' + str(res.text))
            return False, json.loads(res.text)
        return True, json.loads(res.text)

    def create_contact(self, contact):
        res = requests.post(self.base_url + '/contacts', auth=self.auth, data=json.dumps(contact),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})
        if res.status_code != 200:
            self.log.error('(' + str(res.status_code) + ') CreateContactError : ' + str(res.text))
            return False
        return json.loads(res.text)
