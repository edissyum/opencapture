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
import shutil
import urllib3
import facturx
import unittest
import warnings
from src.backend import app
from datetime import datetime
from werkzeug.datastructures import FileStorage
from src.backend.tests import CUSTOM_ID, get_db, get_token


class VerifierTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
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

        return self.app.post(f'/{CUSTOM_ID}/ws/accounts/suppliers/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             json={"args": payload})

    def create_document(self):
        file = f'./custom/{CUSTOM_ID}/src/backend/process_queue_verifier.py'
        text_to_search = rf"@kuyruk.task(queue='verifier_{CUSTOM_ID}')"
        text_to_replace = f"# @kuyruk.task(queue='verifier_{CUSTOM_ID}')"

        with open(file, "r+", encoding='UTF-8') as text_file:
            texts = text_file.read()
            texts = texts.replace(text_to_search, text_to_replace)

        with open(file, "w", encoding='UTF-8') as text_file:
            text_file.write(texts)

        pdf_url = 'https://open-capture.com/wp-content/uploads/2022/11/CALINDA_INV-001510.pdf'
        http = urllib3.PoolManager()

        with http.request('GET', pdf_url, preload_content=False) as _r, open(
                './instance/upload/verifier/CALINDA_INV-001510.pdf', 'wb') as out_file:
            shutil.copyfileobj(_r, out_file)

        my_file = FileStorage(
            stream=open("./instance/upload/verifier/CALINDA_INV-001510.pdf", "rb"),
            filename="CALINDA_INV-001510.pdf",
            content_type="application/pdf",
        )

        return self.app.post(f'/{CUSTOM_ID}/ws/verifier/upload', content_type='multipart/form-data',
                             data={"file": my_file, "workflowId": 'default_workflow'},
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

    def test_successful_upload_file(self):
        supplier = self.create_supplier()
        document_res = self.create_document()

        self.database.execute("SELECT * FROM documents")
        document = self.database.fetchall()
        self.assertEqual(supplier.json['id'], document[0]['supplier_id'])
        self.assertEqual(408.50, float(document[0]['datas']['total_vat']))
        self.assertEqual(2042.5, float(document[0]['datas']['total_ht']))
        self.assertEqual(408.50, float(document[0]['datas']['vat_amount']))
        self.assertEqual(2451.0, float(document[0]['datas']['total_ttc']))
        self.assertEqual("15/12/2016", document[0]['datas']['document_date'])
        self.assertEqual("INV-001510", document[0]['datas']['invoice_number'])
        self.assertEqual(2042.5, float(document[0]['datas']['no_rate_amount']))
        self.assertEqual("14/01/2017", document[0]['datas']['document_due_date'])
        self.assertEqual("AM161941219-1607", document[0]['datas']['quotation_number'])
        self.assertEqual(200, document_res.status_code)

    def test_successful_get_documents_list(self):
        self.create_supplier()
        self.create_document()
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/documents/list', json={},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['documents']), 1)

    def test_successful_get_document_by_id(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        response = self.app.get(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']), json={},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(document[0]['id'], response.json['id'])

    def test_successful_update_positions(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        new_position = {
            "invoice_number": {
                "x": 467.72950819672127,
                "y": 221.1547131147541,
                "width": 343.171106557377,
                "height": 88.9702868852459,
                "ocr_from_user": True
            }
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/updatePosition',
                                json={"args": new_position},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT positions FROM documents")
        document = self.database.fetchall()
        self.assertEqual(467.72950819672127, document[0]['positions']['invoice_number']['x'])
        self.assertEqual(221.1547131147541, document[0]['positions']['invoice_number']['y'])
        self.assertEqual(343.171106557377, document[0]['positions']['invoice_number']['width'])
        self.assertEqual(88.9702868852459, document[0]['positions']['invoice_number']['height'])

    def test_successful_update_page(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        new_page = {
            "invoice_number": 2
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/updatePage',
                                json={"args": new_page},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT pages FROM documents")
        document = self.database.fetchall()
        self.assertEqual(2, document[0]['pages']['invoice_number'])

    def test_successful_update_data(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        new_data = {
            "invoice_number": "test_document_number",
            "quotation_number": "test_quotation_number"
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/updateData',
                                json={"args": new_data},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT datas FROM documents")
        document = self.database.fetchall()
        self.assertEqual('test_document_number', document[0]['datas']['invoice_number'])
        self.assertEqual('test_quotation_number', document[0]['datas']['quotation_number'])

    def test_successful_delete_document(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/verifier/documents/delete/' + str(document[0]['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT status FROM documents")
        document = self.database.fetchall()
        self.assertEqual('DEL', document[0]['status'])

    def test_successful_delete_document_data(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/deleteData',
                                json={'args': 'invoice_number'},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT datas FROM documents")
        document = self.database.fetchall()
        self.assertTrue('invoice_number' not in document[0]['datas'])

    def test_successful_delete_document_document(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id, path, filename FROM documents")
        document = self.database.fetchall()
        response = self.app.get(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/deleteDocuments',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertFalse(os.path.isfile(document[0]['path'] + '/' + document[0]['filename']))

    def test_successful_delete_document_position(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/deletePosition',
                                json={'args': 'invoice_number'},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT positions FROM documents")
        document = self.database.fetchall()
        self.assertFalse('invoicer_number' in document[0]['positions'])

    def test_successful_delete_document_page(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/deletePage',
                                json={'args': 'invoice_number'},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT pages FROM documents")
        document = self.database.fetchall()
        self.assertFalse('invoicer_number' in document[0]['pages'])

    def test_successful_get_totals(self):
        self.create_supplier()
        self.create_document()
        response = self.app.get(f'/{CUSTOM_ID}/ws/verifier/documents/totals/NEW/1',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.json['totals']['today'])

    def test_successful_get_thumb(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT full_jpg_filename FROM documents")
        document = self.database.fetchall()
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/getThumb',
                                 json={'args': {'type': 'full', 'filename': document[0]['full_jpg_filename']}},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(str, type(response.json['file']))

    def test_successful_ocr_on_fly(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT full_jpg_filename FROM documents")
        document = self.database.fetchall()
        data = {
            'selection': {
                'id': 8,
                'x': 226,
                'y': 110,
                'z': 100,
                'height': 43,
                'width': 151
            },
            'fileName': document[0]['full_jpg_filename'],
            'lang': 'fra',
            'thumbSize': {
                'width': 1228,
                'height': 1736
            },
            'registerDate': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/ocrOnFly', json=data,
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual('INV-001510', response.json['result'])

    def test_successful_update(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        new_data = {
            "locked": True
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/update',
                                json={"args": new_data},
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT locked FROM documents")
        document = self.database.fetchall()
        self.assertTrue(document[0]['locked'])

    def test_successful_remove_lock_by_user_id(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        new_data = {
            "locked": True,
            "locked_by": "admin"
        }
        self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/update', json={"args": new_data},
                     headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        response = self.app.put(f'/{CUSTOM_ID}/ws/verifier/documents/removeLockByUserId/admin',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.database.execute("SELECT * FROM documents")
        document = self.database.fetchall()
        self.assertFalse(document[0]['locked'])

    def test_successful_export_xml(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        self.database.execute("SELECT * FROM outputs WHERE output_type_id = 'export_xml' AND module = 'verifier'")
        output = self.database.fetchall()
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/export_xml',
                                 json={'args': output[0]},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertTrue(os.path.isfile(f'/var/share/{CUSTOM_ID}/export/verifier/INV-001510_F_15-12-2016_FR04493811251.xml'))

    def test_successful_export_pdf(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        self.database.execute("SELECT * FROM outputs WHERE output_type_id = 'export_pdf'")
        output = self.database.fetchall()
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/export_pdf',
                                 json={'args': output[0]},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertTrue(os.path.isfile(f'/var/share/{CUSTOM_ID}/export/verifier/INV-001510_F_15-12-2016_FR04493811251.pdf'))

    def test_successful_export_facturx(self):
        self.create_supplier()
        self.create_document()
        self.database.execute("SELECT id FROM documents")
        document = self.database.fetchall()
        self.database.execute("SELECT * FROM outputs WHERE output_type_id = 'export_facturx'")
        output = self.database.fetchall()
        response = self.app.post(f'/{CUSTOM_ID}/ws/verifier/documents/' + str(document[0]['id']) + '/export_facturx',
                                 json={'args': output[0]},
                                 headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})

        is_facturx = False
        with open(f'/var/share/{CUSTOM_ID}/export/verifier/INV-001510_F_15-12-2016_FR04493811251.pdf', 'rb') as f:
            _, _xml_content = facturx.get_facturx_xml_from_pdf(f.read())
            if _ is not None:
                is_facturx = True

        self.assertEqual(200, response.status_code)
        self.assertTrue(os.path.isfile(f'/var/share/{CUSTOM_ID}/export/verifier/INV-001510_F_15-12-2016_FR04493811251.pdf'))
        self.assertTrue(is_facturx)

    def tearDown(self) -> None:
        file = f'./custom/{CUSTOM_ID}/src/backend/process_queue_verifier.py'
        text_to_search = rf"# @kuyruk.task(queue='verifier_{CUSTOM_ID}')"
        text_to_replace = f"@kuyruk.task(queue='verifier_{CUSTOM_ID}')"

        with open(file, "r+") as text_file:
            texts = text_file.read()
            texts = texts.replace(text_to_search, text_to_replace)

        with open(file, "w") as text_file:
            text_file.write(texts)

        self.database.execute("TRUNCATE TABLE documents")
        self.database.execute("TRUNCATE TABLE accounts_supplier")
        shutil.rmtree(f'/var/share/{CUSTOM_ID}/export/verifier/')
        shutil.rmtree(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/full')
        shutil.rmtree(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/thumbs')
        shutil.rmtree(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/original_pdf')
        os.mkdir(f'/var/share/{CUSTOM_ID}/export/verifier/')
        os.mkdir(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/full/')
        os.mkdir(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/thumbs/')
        os.mkdir(f'/var/docservers/opencapture/{CUSTOM_ID}/verifier/original_pdf/')
