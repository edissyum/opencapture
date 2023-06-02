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
import unittest
import warnings
from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class UserTest(unittest.TestCase):
    def setUp(self):
        self.database = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def create_supplier(self, address_id=1):
        payload = {
            "get_only_raw_footer": False,
            "name": "Test Supplier",
            "vat_number": "FR123456789",
            "siret": "1234567891011",
            "siren": "123456789",
            "iban": "FR76123456789",
            "email": "test@test.fr",
            "form_id": 1,
            "document_lang": "fra",
            "address_id": address_id
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/accounts/suppliers/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             json={"args": payload})

    def create_customer(self):
        payload = {
            "name": "Test Customer",
            "vat_number": "FR123456789",
            "siret": "1234567891011",
            "siren": "123456789",
            "company_number": "123",
            "address_id": 1
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/accounts/customers/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             json={"args": payload})

    def create_address(self):
        payload = {
            "address1": "Avenue de la Test",
            "address2": "Bâtiment B",
            "postal_code": "84200",
            "city": "Carpentras",
            "country": "France"
        }

        return self.app.post(f'/{CUSTOM_ID}/ws/accounts/addresses/create',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                             json={"args": payload})

    def test_successful_create_supplier(self):
        supplier = self.create_supplier()
        self.assertEqual(int, type(supplier.json['id']))
        self.assertEqual(200, supplier.status_code)

    def test_successful_create_customer(self):
        customer = self.create_customer()
        self.assertEqual(int, type(customer.json['id']))
        self.assertEqual(200, customer.status_code)

    def test_successful_create_address(self):
        supplier = self.create_address()
        self.assertEqual(int, type(supplier.json['id']))
        self.assertEqual(200, supplier.status_code)

    def test_successful_get_suppliers_list(self):
        self.create_supplier()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/suppliers/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['suppliers']), 1)

    def test_successful_get_suppliers_list_search(self):
        self.create_supplier()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/suppliers/list?search=Test',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['suppliers']), 1)

    def test_successful_get_suppliers_list_limit(self):
        self.create_supplier()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/suppliers/list?limit=0',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['suppliers']), 0)

    def test_successful_get_supplier_by_id(self):
        supplier = self.create_supplier()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/suppliers/getById/' + str(supplier.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual('OK', response.json['status'])
        self.assertFalse(response.json['skip_auto_validate'])
        self.assertEqual('123456789', response.json['siren'])
        self.assertEqual('fra', response.json['document_lang'])
        self.assertEqual('test@test.fr', response.json['email'])
        self.assertEqual('FR76123456789', response.json['iban'])
        self.assertEqual('Test Supplier', response.json['name'])
        self.assertEqual('1234567891011', response.json['siret'])
        self.assertEqual('FR123456789', response.json['vat_number'])

    def test_successful_get_address_by_id(self):
        address = self.create_address()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/getAdressById/' + str(address.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual('France', response.json['country'])
        self.assertEqual('Carpentras', response.json['city'])
        self.assertEqual('84200', response.json['postal_code'])
        self.assertEqual('Bâtiment B', response.json['address2'])
        self.assertEqual('Avenue de la Test', response.json['address1'])

    def test_successful_update_supplier(self):
        supplier = self.create_supplier()
        payload = {
            "get_only_raw_footer": True,
            "name": "Test Supplier Updated",
            "vat_number": "FR123456788",
            "siret": "1234567891012",
            "siren": "123456788",
            "iban": "FR76123456788",
            "email": "test_updated@test.fr",
            "form_id": 2,
            "document_lang": "eng",
            "address_id": 2
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/suppliers/update/' + str(supplier.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT * FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual(2, new_supplier[0]['form_id'])
        self.assertEqual(2, new_supplier[0]['address_id'])
        self.assertEqual("123456788", new_supplier[0]['siren'])
        self.assertEqual("eng", new_supplier[0]['document_lang'])
        self.assertEqual("FR76123456788", new_supplier[0]['iban'])
        self.assertEqual("1234567891012", new_supplier[0]['siret'])
        self.assertEqual("FR123456788", new_supplier[0]['vat_number'])
        self.assertEqual("test_updated@test.fr", new_supplier[0]['email'])
        self.assertEqual("Test Supplier Updated", new_supplier[0]['name'])
        self.assertTrue(new_supplier[0]['get_only_raw_footer'])
        self.assertEqual(int, type(supplier.json['id']))
        self.assertEqual(200, supplier.status_code)

    def test_successful_update_address(self):
        address = self.create_address()
        payload = {
            "address1": "Avenue de la Test UPDATED",
            "address2": "Bâtiment B UPDATED",
            "postal_code": "84202",
            "city": "Carpentras UPDATED",
            "country": "France UPDATED",
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/addresses/update/' + str(address.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT * FROM addresses WHERE id = " + str(address.json['id']))
        new_address = self.database.fetchall()
        self.assertEqual("Avenue de la Test UPDATED", new_address[0]['address1'])
        self.assertEqual("Bâtiment B UPDATED", new_address[0]['address2'])
        self.assertEqual("84202", new_address[0]['postal_code'])
        self.assertEqual("Carpentras UPDATED", new_address[0]['city'])
        self.assertEqual("France UPDATED", new_address[0]['country'])
        self.assertEqual(200, response.status_code)

    def test_successful_update_address_by_supplier_id(self):
        address = self.create_address()
        supplier = self.create_supplier(address.json['id'])
        payload = {
            "address1": "Avenue de la Test UPDATED",
            "address2": "Bâtiment B UPDATED",
            "postal_code": "84202",
            "city": "Carpentras UPDATED",
            "country": "France UPDATED",
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/addresses/updateBySupplierId/' + str(supplier.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT * FROM addresses WHERE id = " + str(address.json['id']))
        new_address = self.database.fetchall()
        self.assertEqual("Avenue de la Test UPDATED", new_address[0]['address1'])
        self.assertEqual("Bâtiment B UPDATED", new_address[0]['address2'])
        self.assertEqual("84202", new_address[0]['postal_code'])
        self.assertEqual("Carpentras UPDATED", new_address[0]['city'])
        self.assertEqual("France UPDATED", new_address[0]['country'])
        self.assertEqual(200, response.status_code)

    def test_successful_update_supplier_position(self):
        supplier = self.create_supplier()
        payload = {
            "form_id": 1,
            "invoice_number": {
                "x": 467.72950819672127,
                "y": 221.1547131147541,
                "width": 343.171106557377,
                "height": 88.9702868852459,
                "ocr_from_user": True
            }
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/supplier/' + str(supplier.json['id']) + '/updatePosition',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.database.execute("SELECT positions FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(new_supplier[0]['positions']))
        self.assertEqual({
            '1': {
                'invoice_number': {
                    'x': 467.72950819672127,
                    'y': 221.1547131147541,
                    'width': 343.171106557377,
                    'height': 88.9702868852459,
                    'ocr_from_user': True
                }
            }
        }, new_supplier[0]['positions'])

    def test_successful_update_supplier_page(self):
        supplier = self.create_supplier()
        payload = {
            "form_id": 1,
            "invoice_number": 1
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/supplier/' + str(supplier.json['id']) + '/updatePage',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.database.execute("SELECT pages FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(new_supplier[0]['pages']))
        self.assertEqual({'1': {'invoice_number': 1}}, new_supplier[0]['pages'])

    def test_successful_delete_supplier(self):
        supplier = self.create_supplier()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/accounts/suppliers/delete/' + str(supplier.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT status FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual("DEL", new_supplier[0]['status'])

    def test_successful_delete_supplier_positions(self):
        supplier = self.create_supplier()
        payload = {
            "form_id": 1,
            "invoice_number": {
                "x": 467.72950819672127,
                "y": 221.1547131147541,
                "width": 343.171106557377,
                "height": 88.9702868852459,
                "ocr_from_user": True
            }
        }
        self.app.put(f'/{CUSTOM_ID}/ws/accounts/supplier/' + str(supplier.json['id']) + '/updatePosition',
                     headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                     json={'args': payload})
        response = self.app.delete(f'/{CUSTOM_ID}/ws/accounts/suppliers/deletePositions/' + str(supplier.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT positions FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual({}, new_supplier[0]['positions'])

    def test_successful_delete_supplier_position(self):
        supplier = self.create_supplier()
        payload = {
            "form_id": 1,
            "invoice_number": {
                "x": 467.72950819672127,
                "y": 221.1547131147541,
                "width": 343.171106557377,
                "height": 88.9702868852459,
                "ocr_from_user": True
            }
        }
        self.app.put(f'/{CUSTOM_ID}/ws/accounts/supplier/' + str(supplier.json['id']) + '/updatePosition',
                     headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                     json={'args': payload})
        payload = {
            "form_id": 1,
            "field_id": 'invoice_number'
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/suppliers/' + str(supplier.json['id']) + '/deletePosition',
                                headers={"Content-Type": "application/json",
                                         'Authorization': 'Bearer ' + self.token}, json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT positions FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual({'1': {}}, new_supplier[0]['positions'])

    def test_successful_delete_supplier_page(self):
        supplier = self.create_supplier()
        payload = {
            "form_id": 1,
            "invoice_number": 1
        }
        self.app.put(f'/{CUSTOM_ID}/ws/accounts/supplier/' + str(supplier.json['id']) + '/updatePage',
                     headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                     json={'args': payload})
        payload = {
            "form_id": 1,
            "field_id": 'invoice_number'
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/suppliers/' + str(supplier.json['id']) + '/deletePage',
                                headers={"Content-Type": "application/json",
                                         'Authorization': 'Bearer ' + self.token}, json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT pages FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertEqual({'1': {}}, new_supplier[0]['pages'])

    def test_successful_update_supplier_skip_autovalidate(self):
        supplier = self.create_supplier()
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/suppliers/skipAutoValidate/' + str(supplier.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT skip_auto_validate FROM accounts_supplier WHERE id = " + str(supplier.json['id']))
        new_supplier = self.database.fetchall()
        self.assertTrue(new_supplier[0]['skip_auto_validate'])
        self.assertEqual(200, supplier.status_code)

    def test_successful_get_customers_list(self):
        self.create_customer()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/customers/list',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['customers']), 2)

    def test_successful_get_customers_list_search(self):
        self.create_customer()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/customers/list?search=Test',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['customers']), 1)

    def test_successful_get_customers_list_limit(self):
        self.create_customer()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/customers/list?limit=0',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual(len(response.json['customers']), 0)

    def test_successful_get_customer_by_id(self):
        customer = self.create_customer()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/customers/getById/' + str(customer.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.json))
        self.assertEqual('OK', response.json['status'])
        self.assertEqual(1, response.json['address_id'])
        self.assertEqual('123456789', response.json['siren'])
        self.assertEqual('Test Customer', response.json['name'])
        self.assertEqual('1234567891011', response.json['siret'])
        self.assertEqual('FR123456789', response.json['vat_number'])

    def test_successful_update_customer(self):
        customer = self.create_customer()
        payload = {
            "name": "Test Customer updated",
            "vat_number": "FR123456788",
            "siret": "1234567891012",
            "siren": "123456788",
            "company_number": "1234",
            "address_id": 2
        }
        response = self.app.put(f'/{CUSTOM_ID}/ws/accounts/customers/update/' + str(customer.json['id']),
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token},
                                json={'args': payload})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT * FROM accounts_customer WHERE id = " + str(customer.json['id']))
        new_customer = self.database.fetchall()
        self.assertEqual(2, new_customer[0]['address_id'])
        self.assertEqual("123456788", new_customer[0]['siren'])
        self.assertEqual("1234567891012", new_customer[0]['siret'])
        self.assertEqual("FR123456788", new_customer[0]['vat_number'])
        self.assertEqual("Test Customer updated", new_customer[0]['name'])

    def test_successful_delete_customer(self):
        customer = self.create_customer()
        response = self.app.delete(f'/{CUSTOM_ID}/ws/accounts/customers/delete/' + str(customer.json['id']),
                                   headers={"Content-Type": "application/json",
                                            'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

        self.database.execute("SELECT status FROM accounts_customer WHERE id = " + str(customer.json['id']))
        new_customer = self.database.fetchall()
        self.assertEqual("DEL", new_customer[0]['status'])

    def test_successful_get_default_accounting_plan(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/customers/getDefaultAccountingPlan',
                                headers={"Content-Type": "application/json",
                                         'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(list, type(response.json))

    def test_successful_get_reference_file(self):
        reference_file = open(
            f'/var/www/html/opencapture/custom/{CUSTOM_ID}/instance/referencial//default_referencial_supplier.ods', 'rb')
        default_reference_file = base64.b64encode(reference_file.read()).decode('utf-8')
        reference_file.close()
        response = self.app.get(f'/{CUSTOM_ID}/ws/accounts/supplier/getReferenceFile',
                                headers={"Content-Type": "application/json",
                                         'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)
        self.assertEqual(default_reference_file, response.json['file'])

    def tearDown(self) -> None:
        shutil.copy('/var/www/html/opencapture/instance/referencial/default_referencial_supplier.ods.default',
                    f'/var/www/html/opencapture/custom/{CUSTOM_ID}/instance/referencial//default_referencial_supplier.ods')
        self.database.execute("TRUNCATE TABLE addresses")
        self.database.execute("TRUNCATE TABLE accounts_supplier")
        self.database.execute("DELETE FROM accounts_customer WHERE name <> 'Splitter - Compte client par défaut'")
