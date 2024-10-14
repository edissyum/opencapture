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

import csv
import math
import json
import pandas as pd


class Spreadsheet:
    def __init__(self, log, docservers, config):
        self.log = log
        self.referencial_supplier_spreadsheet = (docservers['REFERENTIALS_PATH'] + '/' +
                                                 config.cfg['REFERENCIAL']['referencialsupplierdocument'])
        self.referencial_supplier_index = (docservers['REFERENTIALS_PATH'] + '/' +
                                           config.cfg['REFERENCIAL']['referencialsupplierindex'])
        self.referencial_supplier_array = {}
        self.referencial_supplier_data = {}

        with open(self.referencial_supplier_index, encoding='utf-8') as file:
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
            self.referencial_supplier_array['default_currency'] = fp['default_currency']

    @staticmethod
    def read_csv_sheet(referencial_spreadsheet, encoding='utf-8'):
        with open(referencial_spreadsheet, 'r', encoding=encoding) as csvfile:
            sep = str(csv.Sniffer().sniff(csvfile.read()).delimiter)

        content_sheet = pd.read_csv(referencial_spreadsheet, sep=sep, encoding=encoding)
        return content_sheet

    def construct_supplier_array(self, content_sheet):
        tmp_excel_content = pd.DataFrame(content_sheet)
        self.referencial_supplier_data = []
        for line in tmp_excel_content.to_dict(orient='records'):
            if line[self.referencial_supplier_array['postal_code']]:
                if len(str(line[self.referencial_supplier_array['postal_code']])) == 4:
                    line[self.referencial_supplier_array['postal_code']] = '0' + str(
                        line[self.referencial_supplier_array['postal_code']])
            for t in line:
                if isinstance(line[t], (float, int)) and line[t] and not math.isnan(line[t]):
                    line[t] = str(int(line[t]))
            self.referencial_supplier_data.append(line)
