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

import re
import json
from src.backend.functions import search_by_positions, search_custom_positions


class FindQuotationNumber:
    def __init__(self, ocr, files, log, regex, config, database, supplier, file, text, nb_pages, custom_page,
                 footer_text, docservers, configurations, form_id):
        self.ocr = ocr
        self.log = log
        self.text = text
        self.file = file
        self.files = files
        self.regex = regex
        self.config = config
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.nb_pages = nb_pages
        self.docservers = docservers
        self.footer_text = footer_text
        self.custom_page = custom_page
        self.configurations = configurations

    def sanitize_quotation_number(self, data):
        quotation_res = data
        # If the regex return a date, remove it
        for _date in re.finditer(r"" + self.regex['date'] + "", data):
            if _date.group():
                quotation_res = data.replace(_date.group(), '')

        # Delete if mail
        for _mail in re.finditer(r"" + self.regex['email'] + "", quotation_res.lower()):
            for _order in re.finditer(r"" + self.regex['email'] + "", _mail.group().lower()):
                return ''

        # Delete the quotation keyword
        tmp_invoice_number = re.sub(r"" + self.regex['quotation_number'][:-2] + "", '', quotation_res)
        invoice_number = tmp_invoice_number.lstrip().split(' ')[0]
        return invoice_number

    def run(self):
        if self.supplier:
            invoice_number = search_by_positions(self.supplier, 'quotation_number', self.ocr, self.files, self.database, self.form_id, self.log)
            if invoice_number and invoice_number[0]:
                return invoice_number

        if self.supplier and not self.custom_page:
            position = self.database.select({
                'select': [
                    "positions -> '" + str(self.form_id) + "' -> 'quotation_number' as quotation_number_position",
                    "pages -> '" + str(self.form_id) + "' ->'quotation_number' as quotation_number_page"
                ],
                'table': ['accounts_supplier'],
                'where': ['vat_number = %s', 'status <> %s'],
                'data': [self.supplier[0], 'DEL']
            })[0]

            if position and position['quotation_number_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['quotation_number_position'], 'regex': None, 'target': 'full', 'page': position['quotation_number_page']}
                text, position = search_custom_positions(data, self.ocr, self.files, self.regex, self.file, self.docservers)

                try:
                    position = json.loads(position)
                except TypeError:
                    pass

                if text != '':
                    self.log.info('Quotation number found with position : ' + str(text))
                    return [text, position, data['page']]

        for line in self.text:
            for _invoice in re.finditer(r"" + self.regex['quotation_number'] + "", line.content.upper()):
                quotation_number = self.sanitize_quotation_number(_invoice.group())
                if len(quotation_number) >= int(self.configurations['devisSizeMin']):
                    self.log.info('Quotation number found : ' + quotation_number)
                    return [quotation_number, line.position, self.nb_pages]

        for line in self.footer_text:
            for _invoice in re.finditer(r"" + self.regex['quotation_number'] + "", line.content.upper()):
                quotation_number = self.sanitize_quotation_number(_invoice.group())
                if len(quotation_number) >= int(self.configurations['devisSizeMin']):
                    self.log.info('Quotation number found : ' + quotation_number)
                    position = self.files.return_position_with_ratio(line, 'footer')
                    return [quotation_number, position, self.nb_pages]
