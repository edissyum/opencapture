# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import os.path
import re
from ..functions import search_custom_positions


class FindCustom:
    def __init__(self, text, log, locale, config, ocr, files, supplier, file, database):
        self.text = text
        self.Ocr = ocr
        self.Log = log
        self.Locale = locale
        self.Config = config
        self.Files = files
        self.OCRErrorsTable = ocr.OCRErrorsTable
        self.supplier = supplier
        self.file = file
        self.database = database

    def process(self, data):
        for line in self.text:
            line = line.content
            if data['type'] == 'number':
                for item in self.OCRErrorsTable['NUMBERS']:
                    pattern = r'[%s]' % self.OCRErrorsTable['NUMBERS'][item]
                    line = re.sub(pattern, item, line)
            else:
                line = line.upper()

            for res in re.finditer(r"" + data['regex'] + "", line):
                return res.group()

    def run(self):
        data_to_return = {}
        list_of_fields = self.database.select({
            'select': ['positions', 'regex', 'pages'],
            'table': ['positions_masks'],
            'where': ['supplier_id = %s'],
            'data': [self.supplier[2]['supplier_id']]
        })[0]

        if list_of_fields:
            for index in list_of_fields['positions']:
                if 'custom_' in index:
                    _data = {
                        'position': list_of_fields['positions'][index],
                        'regex': list_of_fields['regex'][index] if index in list_of_fields['regex'] else '',
                        'target': 'full',
                        'page': list_of_fields['pages'][index] if index in list_of_fields['pages'] else ''
                    }

                    data, position = search_custom_positions(_data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
                    if not data and list_of_fields[index]['regex'] is not False:
                        data_to_return[index] = [self.process(list_of_fields[index]), position, list_of_fields['pages'][index]]
                        if index in data_to_return and data_to_return[index][0]:
                            data_to_return[index] = [data, position, list_of_fields['pages'][index]]
                    else:
                        data_to_return[index] = [data, position, list_of_fields['pages'][index]]
        return data_to_return
