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
import pandas as pd
from pyexcel_ods3 import get_data, save_data


class Spreadsheet:
    def __init__(self, log, config):
        self.Log = log
        self.referencialSuppplierSpreadsheet = config.cfg['REFERENCIAL']['referencialsupplierdocumentpath']
        self.referencialSuppplierIndex = config.cfg['REFERENCIAL']['referencialsupplierindexpath']
        self.referencialSupplierArray = {}
        self.referencialSupplierData = {}

        with open(self.referencialSuppplierIndex) as file:
            fp = json.load(file)
            self.referencialSupplierArray['name'] = fp['name']
            self.referencialSupplierArray['SIRET'] = fp['SIRET']
            self.referencialSupplierArray['SIREN'] = fp['SIREN']
            self.referencialSupplierArray['VATNumber'] = fp['VATNumber']
            self.referencialSupplierArray['adress1'] = fp['adress1']
            self.referencialSupplierArray['adress2'] = fp['adress2']
            self.referencialSupplierArray['adressTown'] = fp['adressTown']
            self.referencialSupplierArray['adressPostalCode'] = fp['adressPostalCode']
            self.referencialSupplierArray['typology'] = fp['typology']

    def write_typo_ods_sheet(self, vat_number, typo):
        content_sheet = get_data(self.referencialSuppplierSpreadsheet)
        for line in content_sheet['Fournisseur']:
            if line and line[1] == vat_number:
                try:
                    line[8] = typo
                except IndexError:
                    line.append(typo)
        save_data(self.referencialSuppplierSpreadsheet, content_sheet)

    def write_typo_excel_sheet(self, vat_number, typo):
        content_sheet = pd.read_excel(self.referencialSuppplierSpreadsheet)
        sheet_name = pd.ExcelFile(self.referencialSuppplierSpreadsheet).sheet_names
        content_sheet = content_sheet.to_dict(orient='records')

        for line in content_sheet:
            if line[self.referencialSupplierArray['VATNumber']] == vat_number:
                line[self.referencialSupplierArray['typology']] = typo

        content_sheet = pd.DataFrame(content_sheet)
        writer = pd.ExcelWriter(self.referencialSuppplierSpreadsheet, engine='xlsxwriter')
        content_sheet.to_excel(writer, sheet_name=sheet_name[0])
        writer.save()

    @staticmethod
    def read_excel_sheet(referencial_spreadsheet):
        content_sheet = pd.read_excel(referencial_spreadsheet)
        return content_sheet

    def read_ods_sheet(self, referencial_spreadsheet):
        content_sheet = get_data(referencial_spreadsheet)
        content_sheet = content_sheet['Fournisseur']
        content_sheet = pd.DataFrame(content_sheet, columns=[
            self.referencialSupplierArray['name'],
            self.referencialSupplierArray['VATNumber'],
            self.referencialSupplierArray['SIRET'],
            self.referencialSupplierArray['SIREN'],
            self.referencialSupplierArray['adress1'],
            self.referencialSupplierArray['adress2'],
            self.referencialSupplierArray['adressPostalCode'],
            self.referencialSupplierArray['adressTown'],
            self.referencialSupplierArray['typology']
        ])
        # Drop row 0 because it contains the indexes columns
        content_sheet = content_sheet.drop(0)
        # Drop empty rows
        content_sheet = content_sheet.dropna(axis=0, how='all', thresh=None, subset=None)

        return content_sheet

    def construct_supplier_array(self, content_sheet):
        # Create the first index of array, with provider number (taxe number)
        tmp_provider_number = pd.DataFrame(content_sheet, columns=[self.referencialSupplierArray['VATNumber']]).drop_duplicates()
        for value in tmp_provider_number.to_dict(orient='records'):
            self.referencialSupplierData[value[self.referencialSupplierArray['VATNumber']]] = []

        # Then go through the Excel document and fill our final array with all infos about the provider and the bill
        tmp_excel_content = pd.DataFrame(content_sheet)
        for line in tmp_excel_content.to_dict(orient='records'):
            if line[self.referencialSupplierArray['typology']] == line[self.referencialSupplierArray['typology']] and line[self.referencialSupplierArray['typology']]:
                try:
                    line[self.referencialSupplierArray['typology']] = int(line[self.referencialSupplierArray['typology']])
                except ValueError:
                    line[self.referencialSupplierArray['typology']] = line[self.referencialSupplierArray['typology']]

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

            if line[self.referencialSupplierArray['adressPostalCode']] == line[self.referencialSupplierArray['adressPostalCode']] and line[self.referencialSupplierArray['adressPostalCode']]:
                if len(str(line[self.referencialSupplierArray['adressPostalCode']])) == 4:
                    line[self.referencialSupplierArray['adressPostalCode']] = '0' + str(line[self.referencialSupplierArray['adressPostalCode']])
            self.referencialSupplierData[line[self.referencialSupplierArray['VATNumber']]].append(line)
