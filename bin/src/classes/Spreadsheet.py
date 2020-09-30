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
from collections import OrderedDict

import pandas as pd
from pyexcel_ods3 import get_data, save_data

class Spreadsheet:
    def __init__(self, Log, Config):
        self.Log                                = Log
        self.referencialSuppplierSpreadsheet    = Config.cfg['REFERENCIAL']['referencialsupplierdocumentpath']
        self.referencialSuppplierIndex          = Config.cfg['REFERENCIAL']['referencialsupplierindexpath']
        self.referencialSupplierArray           = {}
        self.referencialSupplierData            = {}

        with open(self.referencialSuppplierIndex) as file:
            fp = json.load(file)
            self.referencialSupplierArray['name']               = fp['name']
            self.referencialSupplierArray['SIRET']              = fp['SIRET']
            self.referencialSupplierArray['SIREN']              = fp['SIREN']
            self.referencialSupplierArray['VATNumber']          = fp['VATNumber']
            self.referencialSupplierArray['adress1']            = fp['adress1']
            self.referencialSupplierArray['adress2']            = fp['adress2']
            self.referencialSupplierArray['adressTown']         = fp['adressTown']
            self.referencialSupplierArray['adressPostalCode']   = fp['adressPostalCode']
            self.referencialSupplierArray['typology']           = fp['typology']

    def write_typo_ods_sheet(self, vat_number, typo):
        contentSheet = get_data(self.referencialSuppplierSpreadsheet)
        for line in contentSheet['Fournisseur']:
            if line and line[1] == vat_number:
                line.append(typo)
        save_data(self.referencialSuppplierSpreadsheet, contentSheet)

    def write_typo_excel_sheet(self, vat_number, typo):
        contentSheet = pd.read_excel(self.referencialSuppplierSpreadsheet)
        sheetName = pd.ExcelFile(self.referencialSuppplierSpreadsheet).sheet_names
        contentSheet = contentSheet.to_dict(orient='records')

        for line in contentSheet:
            if line[self.referencialSupplierArray['VATNumber']] == vat_number:
                line[self.referencialSupplierArray['typology']] = typo

        contentSheet = pd.DataFrame(contentSheet)
        writer = pd.ExcelWriter(self.referencialSuppplierSpreadsheet, engine='xlsxwriter')
        contentSheet.to_excel(writer, sheet_name=sheetName[0])
        writer.save()

    @staticmethod
    def read_excel_sheet(referencialSpreadsheet):
        contentSheet = pd.read_excel(referencialSpreadsheet)
        return contentSheet

    def read_ods_sheet(self, referencialSpreadsheet):
        contentSheet = get_data(referencialSpreadsheet)
        contentSheet = contentSheet['Fournisseur']
        contentSheet = pd.DataFrame(contentSheet, columns=[
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
        contentSheet = contentSheet.drop(0)
        # Drop empty rows
        contentSheet = contentSheet.dropna(axis=0, how='all', thresh=None, subset=None)

        return contentSheet

    def construct_supplier_array(self, contentSheet):
        # Create the first index of array, with provider number (taxe number)
        tmpProviderNumber = pd.DataFrame(contentSheet, columns=[self.referencialSupplierArray['VATNumber']]).drop_duplicates()
        for value in tmpProviderNumber.to_dict(orient='records'):
            self.referencialSupplierData[value[self.referencialSupplierArray['VATNumber']]] = []

        # Then go through the Excel document and fill our final array with all infos about the provider and the bill
        tmpExcelContent = pd.DataFrame(contentSheet)
        for line in tmpExcelContent.to_dict(orient='records'):
            if line[self.referencialSupplierArray['typology']] == line[self.referencialSupplierArray['typology']]:
                line[self.referencialSupplierArray['typology']] = int(line[self.referencialSupplierArray['typology']])
            self.referencialSupplierData[line[self.referencialSupplierArray['VATNumber']]].append(line)

