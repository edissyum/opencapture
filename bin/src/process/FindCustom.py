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

import re
from webApp.functions import search_custom_positions, retrieve_custom_positions

class FindCustom:
    def __init__(self, text, Log, Locale, Config, Ocr, Files, supplier):
        self.text = text
        self.Ocr = Ocr
        self.Log = Log
        self.Locale = Locale
        self.Config = Config
        self.Files = Files
        self.OCRErrorsTable = Ocr.OCRErrorsTable
        self.supplier = supplier

    def process(self, data):
        for line in self.text:
            line = line.content
            if data['onlynumber']:
                for item in self.OCRErrorsTable['NUMBERS']:
                    pattern = r'[%s]' % self.OCRErrorsTable['NUMBERS'][item]
                    line = re.sub(pattern, item, line)
            else:
                line = line.upper()

            for res in re.finditer(r"" + data['regex'] + "", line):
                return res.group()

    def run(self):
        dataToReturn = {}
        if self.supplier:
            list_of_fields = retrieve_custom_positions(self.supplier[2]['typology'], self.Config)
            for index in list_of_fields:
                data, position = search_custom_positions(list_of_fields[index], self.Ocr, self.Files, self.Locale)
                if not data and list_of_fields[index]['regex'] is not False:
                    dataToReturn[index] = [self.process(list_of_fields[index]), position, list_of_fields[index]['column']]
                    if index == 'custom-birth_date':
                        if dataToReturn[index]:
                            for date in re.finditer(r"" + self.Locale.dateRegex, dataToReturn[index][0]):
                                dataToReturn[index] = [date.group(), position, list_of_fields[index]['column']]
                else:
                    if index == 'custom-birth_date':
                        if index in dataToReturn:
                            for date in re.finditer(r"" + self.Locale.dateRegex, dataToReturn[index][0]):
                                dataToReturn[index] = [date.group(), position, list_of_fields[index]['column']]
                    dataToReturn[index] = [data, position, list_of_fields[index]['column']]
            return dataToReturn