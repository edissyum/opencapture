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
import re
import csv

class FindCurrency:
    def __init__(self, ocr, log, regex, files, supplier, database, file, docservers, form_id):
        self.ocr = ocr
        self.log = log
        self.file = file
        self.nb_page = 1
        self.files = files
        self.regex = regex
        self.text = ocr.text
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.custom_page = False
        self.docservers = docservers
        self.header_text = ocr.header_text
        self.footer_text = ocr.footer_text

        self.CURRENCY_CODES = {}
        file_path = self.docservers['REFERENTIALS_PATH'] + '/CURRENCY_CODE.csv'
        if os.path.isfile(file_path):
            with open(file_path, encoding='UTF-8') as currency_file:
                sep = str(csv.Sniffer().sniff(currency_file.read()).delimiter)
                currency_file.seek(0)
                csv_reader = csv.reader(currency_file, delimiter=sep)
                for row in csv_reader:
                    self.CURRENCY_CODES[row[0]] = row[1]

    def process(self, line):
        for _currency in re.finditer(r"" + self.regex['currency'], line):
            currency_groups = _currency.groups()
            for curr in currency_groups:
                if not curr:
                    continue

                currency = re.sub(r'\s*\d*[.,|)(\'"]?', '', curr)
                if currency in self.CURRENCY_CODES:
                    return self.CURRENCY_CODES[currency]

                for _c in self.CURRENCY_CODES:
                    if currency == self.CURRENCY_CODES[_c]:
                        return currency


    def run(self):
        cpt = 0
        for text in [self.footer_text, self.header_text, self.text]:
            for line in text:
                currency = self.process(line.content.upper())
                if currency:
                    self.log.info('Currency found : ' + currency)
                    return [currency, '', self.nb_page]
            cpt += 1
