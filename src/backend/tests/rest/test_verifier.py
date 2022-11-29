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


import base64
import shutil
import urllib3
import unittest
import warnings
from src.backend import app
from src.backend.tests import get_db, get_token
from werkzeug.datastructures import FileStorage


class VerifierTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_supplier(self):
        payload = {
            "get_only_raw_footer": False,
            "name": "Calinda",
            "vat_number": "FR04493811251",
            "siret": "49381125100013",
            "siren": "493811251",
            "iban": "",
            "email": "",
            "form_id": 1,
            "address_id": 1,
            "document_lang": "fra",
        }

        return self.app.post('/test/ws/accounts/suppliers/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             json={"args": payload})

    def create_invoice(self):
        file = './custom/test/src/backend/process_queue_verifier.py'
        text_to_search = r"@kuyruk.task(queue='verifier_test')"
        text_to_replace = "# @kuyruk.task(queue='verifier_test')"

        with open(file, "r+") as text_file:
            texts = text_file.read()
            texts = texts.replace(text_to_search, text_to_replace)

        with open(file, "w") as text_file:
            text_file.write(texts)

        pdf_url = 'https://open-capture.com/wp-content/uploads/2022/11/CALINDA_INV-001510.pdf'
        http = urllib3.PoolManager()

        with http.request('GET', pdf_url, preload_content=False) as r, open(
                './instance/upload/verifier/CALINDA_INV-001510.pdf', 'wb') as out_file:
            shutil.copyfileobj(r, out_file)

        my_file = FileStorage(
            stream=open("./instance/upload/verifier/CALINDA_INV-001510.pdf", "rb"),
            filename="CALINDA_INV-001510.pdf",
            content_type="application/pdf",
        )

        return self.app.post('/test/ws/verifier/upload', data={"inputId": 1, "file": my_file},
                             content_type='multipart/form-data',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_upload_file(self):
        supplier = self.create_supplier()
        invoice_res = self.create_invoice()

        self.db.execute("SELECT * FROM invoices")
        invoice = self.db.fetchall()
        self.assertEqual(supplier.json['id'], invoice[0]['supplier_id'])
        self.assertEqual(408.50, float(invoice[0]['datas']['total_vat']))
        self.assertEqual(2042.5, float(invoice[0]['datas']['total_ht']))
        self.assertEqual(408.50, float(invoice[0]['datas']['vat_amount']))
        self.assertEqual(2451.0, float(invoice[0]['datas']['total_ttc']))
        self.assertEqual("15/12/2016", invoice[0]['datas']['document_date'])
        self.assertEqual("INV-001510", invoice[0]['datas']['invoice_number'])
        self.assertEqual(2042.5, float(invoice[0]['datas']['no_rate_amount']))
        self.assertEqual("14/01/2017", invoice[0]['datas']['document_due_date'])
        self.assertEqual("AM161941219-1607", invoice[0]['datas']['quotation_number'])
        self.assertEqual(200, invoice_res.status_code)

    def test_successful_get_invoices_list(self):
        self.create_supplier()
        self.create_invoice()
        response = self.app.post('/test/ws/verifier/invoices/list', json={},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['invoices']), 1)

    def test_successful_get_invoice_by_id(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        response = self.app.get('/test/ws/verifier/invoices/' + str(invoice[0]['id']), json={},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(invoice[0]['id'], response.json['id'])

    def test_successful_update_positions(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        new_position = {
            "invoice_number": {
                "x": 467.72950819672127,
                "y": 221.1547131147541,
                "width": 343.171106557377,
                "height": 88.9702868852459,
                "ocr_from_user": True
            }
        }
        response = self.app.put('/test/ws/verifier/invoices/' + str(invoice[0]['id']) + '/updatePosition',
                                json={"args": new_position},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT positions FROM invoices")
        invoice = self.db.fetchall()
        self.assertEqual(467.72950819672127, invoice[0]['positions']['invoice_number']['x'])
        self.assertEqual(221.1547131147541, invoice[0]['positions']['invoice_number']['y'])
        self.assertEqual(343.171106557377, invoice[0]['positions']['invoice_number']['width'])
        self.assertEqual(88.9702868852459, invoice[0]['positions']['invoice_number']['height'])

    def test_successful_update_page(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        new_page = {
            "invoice_number": 2
        }
        response = self.app.put('/test/ws/verifier/invoices/' + str(invoice[0]['id']) + '/updatePage',
                                json={"args": new_page},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT pages FROM invoices")
        invoice = self.db.fetchall()
        self.assertEqual(2, invoice[0]['pages']['invoice_number'])

    def test_successful_update_data(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        new_data = {
            "invoice_number": "test_invoice_number",
            "quotation_number": "test_quotation_number"
        }
        response = self.app.put('/test/ws/verifier/invoices/' + str(invoice[0]['id']) + '/updateData',
                                json={"args": new_data},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT datas FROM invoices")
        invoice = self.db.fetchall()
        self.assertEqual('test_invoice_number', invoice[0]['datas']['invoice_number'])
        self.assertEqual('test_quotation_number', invoice[0]['datas']['quotation_number'])

    def test_successful_delete_invoice(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        response = self.app.delete('/test/ws/verifier/invoices/delete/' + str(invoice[0]['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT status FROM invoices")
        invoice = self.db.fetchall()
        self.assertEqual('DEL', invoice[0]['status'])

    def test_successful_delete_invoice_position(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        response = self.app.put('/test/ws/verifier/invoices/' + str(invoice[0]['id']) + '/deletePosition',
                                json={'args': 'invoice_number'},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT positions FROM invoices")
        invoice = self.db.fetchall()
        self.assertFalse('invoicer_number' in invoice[0]['positions'])

    def test_successful_delete_invoice_page(self):
        self.create_supplier()
        self.create_invoice()
        self.db.execute("SELECT id FROM invoices")
        invoice = self.db.fetchall()
        response = self.app.put('/test/ws/verifier/invoices/' + str(invoice[0]['id']) + '/deletePage',
                                json={'args': 'invoice_number'},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.db.execute("SELECT pages FROM invoices")
        invoice = self.db.fetchall()
        self.assertFalse('invoicer_number' in invoice[0]['pages'])

    def test_successful_get_totals(self):
        self.create_supplier()
        self.create_invoice()
        response = self.app.get('/test/ws/verifier/invoices/totals/NEW/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.json['totals']['today'])

    def tearDown(self) -> None:
        file = './custom/test/src/backend/process_queue_verifier.py'
        text_to_search = r"# @kuyruk.task(queue='verifier_test')"
        text_to_replace = "@kuyruk.task(queue='verifier_test')"

        with open(file, "r+") as text_file:
            texts = text_file.read()
            texts = texts.replace(text_to_search, text_to_replace)

        with open(file, "w") as text_file:
            text_file.write(texts)

        self.db.execute("TRUNCATE TABLE invoices")
        self.db.execute("TRUNCATE TABLE accounts_supplier")
