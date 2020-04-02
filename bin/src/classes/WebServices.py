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
from flask_babel import gettext
from requests.auth import HTTPBasicAuth

class WebServices:
    def __init__(self, host, user, pwd, Log, Config):
        self.baseUrl    = host
        self.auth       = HTTPBasicAuth(user, pwd)
        self.Log        = Log
        self.Config     = Config
        self.check_connection()

    def check_connection(self):
        try:
            requests.get(self.baseUrl)
            return True
        except (requests.ConnectionError, requests.Timeout) as e:
            self.Log.error('Error connecting to the host. Exiting program..')
            self.Log.error('More information : ' + str(e))

            # If the web part isn't launch, the "flash" function will not work. So exit the CLI program
            try :
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

    def insert_with_args(self, args, Config):
        _process            = Config.cfg['GED']['defaultprocess']
        customInvoiceNumber = Config.cfg[_process]['custominvoicenumber']
        customNoRate        = Config.cfg[_process]['customht']
        customAllRate       = Config.cfg[_process]['customttc']
        customBudget        = Config.cfg[_process]['custombudget']
        customOutcome       = Config.cfg[_process]['customoutcome']
        customVATNumber     = Config.cfg[_process]['customvatnumber']
        customOrderNumber   = Config.cfg[_process]['customordernumber']
        customDeliveryNumber= Config.cfg[_process]['customdeliverynumber']
        contact             = args['contact']
        if not contact:
            contact = {'id' : '', 'contact_id' : ''}
        data = {
            'encodedFile'           : base64.b64encode(args['fileContent']).decode('utf-8'),
            'priority'              : Config.cfg[_process]['priority'],
            'status'                : args['status'],
            'type_id'               : Config.cfg[_process]['typeid'],
            'format'                : Config.cfg[_process]['format'],
            'category_id'           : Config.cfg[_process]['categoryid'],
            'typist'                : Config.cfg[_process]['typist'],
            'subject'               : args['subject'],
            'destination'           : args['destination'],
            'dest_user'             : args['dest_user'],
            'address_id'            : contact['id'],
            'exp_contact_id'        : contact['contact_id'],
            'doc_date'              : args['date'],
            'admission_date'        : args['creationDate'],
            customBudget            : args[customBudget] if customBudget in args else '',
            customNoRate            : args[customNoRate] if customNoRate in args else '',
            customAllRate           : args[customAllRate] if customAllRate in args else '',
            customOutcome           : args[customOutcome] if customOutcome in args else '',
            customVATNumber         : args[customVATNumber] if customVATNumber in args else '',
            customOrderNumber       : args[customOrderNumber] if customOrderNumber in args else '',
            customInvoiceNumber     : args[customInvoiceNumber] if customInvoiceNumber in args else '',
            customDeliveryNumber    : args[customDeliveryNumber] if customDeliveryNumber in args else '',
        }

        res = requests.post(self.baseUrl + 'resources', auth=self.auth, data=json.dumps(data), headers={'Connection':'close', 'Content-Type' : 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertIntoMaarchError : ' + str(res.text))
            return False
        else:
            return res.text

    def insert_attachment(self, fileContent, Config, res_id, _process):
        data = {
            'resId'         : res_id,
            'status'        : Config.cfg[_process]['status'],
            'collId'        : 'letterbox_coll',
            'table'         : 'res_attachments',
            'data'          : [
                {'column' : 'title', 'value' : 'Rapprochement note interne', 'type': 'string'},
                {'column' : 'attachment_type', 'value' : Config.cfg[_process]['attachment_type'], 'type' : 'string'},
                {'column' : 'coll_id', 'value' : 'letterbox_coll', 'type' : 'string'},
                {'column' : 'res_id_master', 'value' : res_id, 'type' : 'string'}
            ],
            'encodedFile'   : base64.b64encode(fileContent).decode('utf-8'),
            'fileFormat'    : Config.cfg[_process]['format'],
        }

        res = requests.post(self.baseUrl + 'attachments', auth=self.auth, data=json.dumps(data), headers={'Connection': 'close', 'Content-Type' : 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertAttachmentsIntoMaarchError : ' + str(res.text))
            return False
        else:
            return res.text

    def insert_attachment_reconciliation(self, fileContent, chrono, _process):
        data = {
            'chrono'            : chrono,
            'encodedFile'       : base64.b64encode(fileContent).decode('utf-8'),
        }

        res = requests.post(self.baseUrl + 'reconciliation/add', auth=self.auth, data=json.dumps(data), headers={'Connection': 'close', 'Content-Type': 'application/json'})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') InsertAttachmentsReconciliationIntoMaarchError : ' + str(res.text))
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

    def retrieve_contact_by_VATNumber(self, VAT):
        res = requests.get(self.baseUrl + 'getContactByVAT', auth=self.auth, params={'VAT': VAT})

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') GetContactByVATError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)

    def create_contact(self, contact):
        res = requests.post(self.baseUrl + '/contacts', auth=self.auth, params=contact)

        if res.status_code != 200:
            self.Log.error('(' + str(res.status_code) + ') CreateContactError : ' + str(res.text))
            return False
        else:
            return json.loads(res.text)