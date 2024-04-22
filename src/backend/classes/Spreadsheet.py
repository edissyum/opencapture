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
            self.referencial_supplier_array['vat_number'] = fp['vat_number']
            self.referencial_supplier_array['siret'] = fp['siret']
            self.referencial_supplier_array['siren'] = fp['siren']
            self.referencial_supplier_array['duns'] = fp['duns']
            self.referencial_supplier_array['bic'] = fp['bic']
            self.referencial_supplier_array['rccm'] = fp['rccm']
            self.referencial_supplier_array['iban'] = fp['iban']
            self.referencial_supplier_array['email'] = fp['email']
            self.referencial_supplier_array['address1'] = fp['address1']
            self.referencial_supplier_array['address2'] = fp['address2']
            self.referencial_supplier_array['postal_code'] = fp['postal_code']
            self.referencial_supplier_array['city'] = fp['city']
            self.referencial_supplier_array['country'] = fp['country']
            self.referencial_supplier_array['get_only_raw_footer'] = fp['get_only_raw_footer']
            self.referencial_supplier_array['lang'] = fp['lang']

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
            self.referencial_supplier_array['vat_number'],
            self.referencial_supplier_array['siret'],
            self.referencial_supplier_array['siren'],
            self.referencial_supplier_array['duns'],
            self.referencial_supplier_array['bic'],
            self.referencial_supplier_array['rccm'],
            self.referencial_supplier_array['iban'],
            self.referencial_supplier_array['email'],
            self.referencial_supplier_array['address1'],
            self.referencial_supplier_array['address2'],
            self.referencial_supplier_array['postal_code'],
            self.referencial_supplier_array['city'],
            self.referencial_supplier_array['country'],
            self.referencial_supplier_array['get_only_raw_footer'],
            self.referencial_supplier_array['lang']
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
                                           columns=[self.referencial_supplier_array['vat_number']]).drop_duplicates()
        for value in tmp_provider_number.to_dict(orient='records'):
            self.referencial_supplier_data[value[self.referencial_supplier_array['vat_number']]] = []

        # Then go through the Excel document and fill our final array with all infos about the provider and the bill
        tmp_excel_content = pd.DataFrame(content_sheet)
        for line in tmp_excel_content.to_dict(orient='records'):
            if line[self.referencial_supplier_array['postal_code']]:
                if len(str(line[self.referencial_supplier_array['postal_code']])) == 4:
                    line[self.referencial_supplier_array['postal_code']] = '0' + str(
                        line[self.referencial_supplier_array['postal_code']])
            self.referencial_supplier_data[line[self.referencial_supplier_array['vat_number']]].append(line)
