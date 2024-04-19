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
        self.referencial_supplier_spreadsheet = (docservers['REFERENTIALS_PATH'] + '/' +
                                                 config.cfg['REFERENCIAL']['referencialsupplierdocument'])
        self.referencial_supplier_index = (docservers['REFERENTIALS_PATH'] + '/' +
                                           config.cfg['REFERENCIAL']['referencialsupplierindex'])
        self.referencial_supplier_array = {}
        self.referencial_supplier_data = {}

        with open(self.referencial_supplier_index, encoding='UTF-8') as file:
            fp = json.load(file)
            self.referencial_supplier_array['name'] = fp['name']
            self.referencial_supplier_array['VATNumber'] = fp['VATNumber']
            self.referencial_supplier_array['SIRET'] = fp['SIRET']
            self.referencial_supplier_array['SIREN'] = fp['SIREN']
            self.referencial_supplier_array['DUNS'] = fp['DUNS']
            self.referencial_supplier_array['BIC'] = fp['BIC']
            self.referencial_supplier_array['RCCM'] = fp['RCCM']
            self.referencial_supplier_array['IBAN'] = fp['IBAN']
            self.referencial_supplier_array['EMAIL'] = fp['EMAIL']
            self.referencial_supplier_array['address1'] = fp['address1']
            self.referencial_supplier_array['address2'] = fp['address2']
            self.referencial_supplier_array['addressPostalCode'] = fp['addressPostalCode']
            self.referencial_supplier_array['addressTown'] = fp['addressTown']
            self.referencial_supplier_array['addressCountry'] = fp['addressCountry']
            self.referencial_supplier_array['get_only_raw_footer'] = fp['get_only_raw_footer']
            self.referencial_supplier_array['doc_lang'] = fp['doc_lang']

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
            self.referencial_supplier_array['name'],
            self.referencial_supplier_array['VATNumber'],
            self.referencial_supplier_array['SIRET'],
            self.referencial_supplier_array['SIREN'],
            self.referencial_supplier_array['DUNS'],
            self.referencial_supplier_array['BIC'],
            self.referencial_supplier_array['RCCM'],
            self.referencial_supplier_array['IBAN'],
            self.referencial_supplier_array['EMAIL'],
            self.referencial_supplier_array['address1'],
            self.referencial_supplier_array['address2'],
            self.referencial_supplier_array['addressPostalCode'],
            self.referencial_supplier_array['addressTown'],
            self.referencial_supplier_array['addressCountry'],
            self.referencial_supplier_array['get_only_raw_footer'],
            self.referencial_supplier_array['doc_lang']
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
                                           columns=[self.referencial_supplier_array['VATNumber']]).drop_duplicates()
        for value in tmp_provider_number.to_dict(orient='records'):
            self.referencial_supplier_data[value[self.referencial_supplier_array['VATNumber']]] = []

        # Then go through the Excel document and fill our final array with all infos about the provider and the bill
        tmp_excel_content = pd.DataFrame(content_sheet)
        for line in tmp_excel_content.to_dict(orient='records'):
            if line[self.referencial_supplier_array['addressPostalCode']]:
                if len(str(line[self.referencial_supplier_array['addressPostalCode']])) == 4:
                    line[self.referencial_supplier_array['addressPostalCode']] = '0' + str(
                        line[self.referencial_supplier_array['addressPostalCode']])
            self.referencial_supplier_data[line[self.referencial_supplier_array['VATNumber']]].append(line)
