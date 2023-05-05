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
import json
import pandas as pd
from pyexcel_ods3 import get_data, save_data


class Spreadsheet:
    def __init__(self, log, docservers, config):
        self.log = log
        self.referencialSuppplierSpreadsheet = docservers['REFERENTIALS_PATH'] + '/' + config.cfg['REFERENCIAL']['referencialsupplierdocument']
        self.referencialSuppplierIndex = docservers['REFERENTIALS_PATH'] + '/' + config.cfg['REFERENCIAL']['referencialsupplierindex']
        self.referencialSupplierArray = {}
        self.referencialSupplierData = {}

        with open(self.referencialSuppplierIndex, encoding='UTF-8') as file:
            fp = json.load(file)
            self.referencialSupplierArray['name'] = fp['name']
            self.referencialSupplierArray['SIRET'] = fp['SIRET']
            self.referencialSupplierArray['SIREN'] = fp['SIREN']
            self.referencialSupplierArray['IBAN'] = fp['IBAN']
            self.referencialSupplierArray['EMAIL'] = fp['EMAIL']
            self.referencialSupplierArray['VATNumber'] = fp['VATNumber']
            self.referencialSupplierArray['address1'] = fp['address1']
            self.referencialSupplierArray['address2'] = fp['address2']
            self.referencialSupplierArray['addressTown'] = fp['addressTown']
            self.referencialSupplierArray['addressCountry'] = fp['addressCountry']
            self.referencialSupplierArray['addressPostalCode'] = fp['addressPostalCode']
            self.referencialSupplierArray['positions_mask_id'] = fp['positions_mask_id']
            self.referencialSupplierArray['get_only_raw_footer'] = fp['get_only_raw_footer']
            self.referencialSupplierArray['doc_lang'] = fp['doc_lang']

    def update_supplier_ods_sheet(self, database):
        if os.path.isfile(self.referencialSuppplierSpreadsheet):
            content_sheet = get_data(self.referencialSuppplierSpreadsheet)

            res = database.select({
                'select': ['*'],
                'table': ['accounts_supplier'],
                'where': ['status = %s'],
                'data': ['OK']
            })

            try:
                sheet_name = False
                for sheet in content_sheet:
                    sheet_name = sheet

                if sheet_name:
                    content_sheet[sheet_name] = content_sheet[sheet_name][:1]
                    for supplier in res:
                        address_id = supplier['address_id']
                        address = False
                        if address_id:
                            address = database.select({
                                'select': ['*'],
                                'table': ['addresses'],
                                'where': ['id = %s'],
                                'data': [address_id],
                            })
                            if address:
                                address = address[0]

                        positions_mask_id = database.select({
                            'select': ['id'],
                            'table': ['positions_masks'],
                            'where': ['supplier_id = %s'],
                            'data': [supplier['id']]
                        })

                        line = [supplier['name'] if supplier['name'] is not None else '',
                                supplier['vat_number'] if supplier['vat_number'] is not None else '',
                                supplier['siret'] if supplier['siret'] is not None else '',
                                supplier['siren'] if supplier['siren'] is not None else '',
                                supplier['duns'] if supplier['duns'] is not None else '',
                                supplier['iban'] if supplier['iban'] is not None else '',
                                supplier['email'] if supplier['email'] is not None else '',
                                address['address1'] if address and address['address1'] is not None else '',
                                address['address2'] if address and address['address2'] is not None else '',
                                address['postal_code'] if address and address['postal_code'] is not None else '',
                                address['city'] if address and address['city'] is not None else '',
                                address['country'] if address and address['country'] is not None else '',
                                positions_mask_id[0]['id'] if positions_mask_id and positions_mask_id[0]['id'] is not None else '',
                                str(not supplier['get_only_raw_footer']).lower() if supplier['get_only_raw_footer'] is not None else '',
                                supplier['document_lang'] if supplier['document_lang'] is not None else '']
                        content_sheet[sheet_name].append(line)
            except IndexError as e:
                self.log.error("IndexError while updating ods reference file : " + str(e), False)

            save_data(self.referencialSuppplierSpreadsheet, content_sheet)
        else:
            self.log.error('The referencial file doesn\'t exist : ' + self.referencialSuppplierSpreadsheet, False)

    @staticmethod
    def read_excel_sheet(referencial_spreadsheet):
        content_sheet = pd.read_excel(referencial_spreadsheet, engine='openpyxl')
        return content_sheet

    @staticmethod
    def read_csv_sheet(referencial_spreadsheet):
        content_sheet = pd.read_csv(referencial_spreadsheet, sep=";")
        return content_sheet

    def read_ods_sheet(self, referencial_spreadsheet):
        content_sheet = get_data(referencial_spreadsheet)
        if 'Fournisseur' in content_sheet:
            content_sheet = content_sheet['Fournisseur']
        content_sheet = pd.DataFrame(content_sheet, columns=[
            self.referencialSupplierArray['name'],
            self.referencialSupplierArray['VATNumber'],
            self.referencialSupplierArray['SIRET'],
            self.referencialSupplierArray['SIREN'],
            self.referencialSupplierArray['DUNS'],
            self.referencialSupplierArray['IBAN'],
            self.referencialSupplierArray['EMAIL'],
            self.referencialSupplierArray['address1'],
            self.referencialSupplierArray['address2'],
            self.referencialSupplierArray['addressPostalCode'],
            self.referencialSupplierArray['addressTown'],
            self.referencialSupplierArray['addressCountry'],
            self.referencialSupplierArray['positions_mask_id'],
            self.referencialSupplierArray['get_only_raw_footer'],
            self.referencialSupplierArray['doc_lang']
        ])
        # Drop row 0 because it contains the indexes columns
        if not content_sheet.empty:
            content_sheet = content_sheet.drop(0)
            # Drop empty rows
            content_sheet = content_sheet.dropna(axis=0, how='all', subset=None)

        return content_sheet

    def construct_supplier_array(self, content_sheet):
        # Create the first index of array, with provider number (taxe number)
        tmp_provider_number = pd.DataFrame(content_sheet,
                                           columns=[self.referencialSupplierArray['VATNumber']]).drop_duplicates()
        for value in tmp_provider_number.to_dict(orient='records'):
            self.referencialSupplierData[value[self.referencialSupplierArray['VATNumber']]] = []

        # Then go through the Excel document and fill our final array with all infos about the provider and the bill
        tmp_excel_content = pd.DataFrame(content_sheet)
        for line in tmp_excel_content.to_dict(orient='records'):
            if line[self.referencialSupplierArray['positions_mask_id']] == line[self.referencialSupplierArray['positions_mask_id']] and line[self.referencialSupplierArray['positions_mask_id']]:
                try:
                    line[self.referencialSupplierArray['positions_mask_id']] = int(line[self.referencialSupplierArray['positions_mask_id']])
                except ValueError:
                    line[self.referencialSupplierArray['positions_mask_id']] = line[self.referencialSupplierArray['positions_mask_id']]

            if line[self.referencialSupplierArray['get_only_raw_footer']] == line[self.referencialSupplierArray['get_only_raw_footer']] and line[self.referencialSupplierArray['get_only_raw_footer']]:
                try:
                    line[self.referencialSupplierArray['get_only_raw_footer']] = int(line[self.referencialSupplierArray['get_only_raw_footer']])
                except ValueError:
                    line[self.referencialSupplierArray['get_only_raw_footer']] = line[self.referencialSupplierArray['get_only_raw_footer']]

            if line[self.referencialSupplierArray['SIRET']] == line[self.referencialSupplierArray['SIRET']] and line[self.referencialSupplierArray['SIRET']]:
                try:
                    line[self.referencialSupplierArray['SIRET']] = int(line[self.referencialSupplierArray['SIRET']])
                except ValueError:
                    line[self.referencialSupplierArray['SIRET']] = line[self.referencialSupplierArray['SIRET']]

            if line[self.referencialSupplierArray['SIREN']] == line[self.referencialSupplierArray['SIREN']] and line[self.referencialSupplierArray['SIREN']]:
                try:
                    line[self.referencialSupplierArray['SIREN']] = int(line[self.referencialSupplierArray['SIREN']])
                except ValueError:
                    line[self.referencialSupplierArray['SIREN']] = line[self.referencialSupplierArray['SIREN']]

            if line[self.referencialSupplierArray['addressPostalCode']] == line[self.referencialSupplierArray['addressPostalCode']] and line[self.referencialSupplierArray['addressPostalCode']]:
                if len(str(line[self.referencialSupplierArray['addressPostalCode']])) == 4:
                    line[self.referencialSupplierArray['addressPostalCode']] = '0' + str(
                        line[self.referencialSupplierArray['addressPostalCode']])
            self.referencialSupplierData[line[self.referencialSupplierArray['VATNumber']]].append(line)
