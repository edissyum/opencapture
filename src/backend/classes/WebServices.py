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


class WebServices:
    def __init__(self, host, user, pwd, log, config):
        self.baseUrl = host
        self.auth = HTTPBasicAuth(user, pwd)
        self.Log = log
        self.Config = config
        self.check_connection()

    def check_connection(self):
        try:
            requests.get(self.baseUrl)
            return True
        except (requests.ConnectionError, requests.Timeout) as e:
            self.Log.error('Error connecting to the host. Exiting program..')
            self.Log.error('More information : ' + str(e))

            # If the web part isn't launch, the "flash" function will not work. So exit the CLI program
            try:
                flash(gettext('CONNECTION_ERROR'))
            except RuntimeError:
                exit('Error while trying to connect to GED')
            return False

    def retrieve_users(self):
        res = requests.get(self.baseUrl + 'getUsers?group=' + self.Config.cfg['GED']['usergroupid'], auth=self.auth)

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') getUsers : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def insert_with_args(self, args, config):
        _process = config.cfg['GED']['defaultprocess']
        custom_invoice_number = config.cfg[_process]['custominvoicenumber']
        custom_no_rate = config.cfg[_process]['customht']
        custom_all_rate = config.cfg[_process]['customttc']
        custom_budget = config.cfg[_process]['custombudget']
        custom_outcome = config.cfg[_process]['customoutcome']
        custom_vat_number = config.cfg[_process]['customvatnumber']
        custom_order_number = config.cfg[_process]['customordernumber']
        custom_delivery_number = config.cfg[_process]['customdeliverynumber']
        contact = args['contact']
        if not contact:
            contact = {}
        else:
            contact = [{'id': contact['id'], 'type': 'contact'}]

        data = {
            'encodedFile': base64.b64encode(args['fileContent']).decode('utf-8'),
            'priority': config.cfg[_process]['priority'],
            'status': args['status'],
            'doctype': config.cfg[_process]['typeid'],
            'format': config.cfg[_process]['format'],
            'modelId': config.cfg[_process]['modelid'],
            'typist': config.cfg[_process]['typist'],
            'subject': args['subject'],
            'destination': args['destination'],
            'senders': contact,
            'documentDate': args['date'],
            'chrono': True if config.cfg[_process]['generate_chrono'] == 'True' else '',
            'arrivaldate': str(datetime.now()),
            'customFields': {},
        }

        if 'dest_user' in args:
            data['dest_user'] = args['dest_user']
            data['diffusionList'] = [{
                'mode': 'dest',
                'type': 'user',
                'id': args['dest_user'],
            }]

        if custom_budget in args:
            data['customFields'][custom_budget] = args[custom_budget]
        if custom_no_rate in args:
            data['customFields'][custom_no_rate] = args[custom_no_rate]
        if custom_all_rate in args:
            data['customFields'][custom_all_rate] = args[custom_all_rate]
        if custom_outcome in args:
            data['customFields'][custom_outcome] = args[custom_outcome]
        if custom_vat_number in args:
            data['customFields'][custom_vat_number] = args[custom_vat_number]
        if custom_order_number in args:
            data['customFields'][custom_order_number] = args[custom_order_number]
        if custom_invoice_number in args:
            data['customFields'][custom_invoice_number] = args[custom_invoice_number]
        if custom_delivery_number in args:
            data['customFields'][custom_delivery_number] = args[custom_delivery_number]

        res = requests.post(self.baseUrl + 'resources', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertIntoMaarchError : ' + str(res.text))
            return False
        else:
            return res.text

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

    def insert_attachment_reconciliation(self, file_content, chrono, _process):
        data = {
            'chrono': chrono,
            'encodedFile': base64.b64encode(file_content).decode('utf-8'),
        }

        res = requests.post(self.baseUrl + 'reconciliation/add', auth=self.auth, data=json.dumps(data),
                            headers={'Connection': 'close', 'Content-Type': 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertAttachmentsReconciliationIntoMaarchError : ' +
                           str(res.text))
            return False
        else:
            return res.text

    def check_attachment(self, chrono):
        res = requests.get(self.baseUrl + 'reconciliation/check', auth=self.auth, params={'chrono': chrono})
        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') CheckAttachmentError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

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
