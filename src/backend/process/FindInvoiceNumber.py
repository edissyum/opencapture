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

import re
import json
from ..functions import search_by_positions, search_custom_positions


class FindInvoiceNumber:
    def __init__(self, ocr, files, log, regex, config, database, supplier, file, typo, text, nb_pages, custom_page, footer_text, docservers, configurations):
        self.vatNumber = ''
        self.Ocr = ocr
        self.text = text
        self.footer_text = footer_text
        self.log = log
        self.Files = files
        self.regex = regex
        self.config = config
        self.docservers = docservers
        self.configurations = configurations
        self.supplier = supplier
        self.Database = database
        self.typo = typo
        self.file = file
        self.nbPages = nb_pages
        self.customPage = custom_page

    def sanitize_invoice_number(self, data):
        invoice_res = data
        # If the regex return a date, remove it
        for _date in re.finditer(r"" + self.regex['dateRegex'] + "", data):
            if _date.group():
                invoice_res = data.replace(_date.group(), '')

        # Delete the invoice keyword
        tmp_invoice_number = re.sub(r"" + self.regex['invoiceRegex'][:-2] + "", '', invoice_res)
        invoice_number = tmp_invoice_number.lstrip().split(' ')[0]
        return invoice_number

    def run(self):
        if self.supplier:
            invoice_number = search_by_positions(self.supplier, 'invoice_number', self.Ocr, self.Files, self.Database)
            if invoice_number and invoice_number[0]:
                return invoice_number

        if self.supplier and not self.customPage:
            position = self.Database.select({
                'select': [
                    "positions ->> 'invoice_number' as invoice_number_position",
                    "pages ->> 'invoice_number' as invoice_number_page"
                ],
                'table': ['accounts_supplier'],
                'where': ['vat_number = %s', 'status <> %s'],
                'data': [self.supplier[0], 'DEL']
            })[0]

            if position and position['invoice_number_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['invoice_number_position'], 'regex': None, 'target': 'full', 'page': position['invoice_number_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.regex, self.file, self.docservers)

                try:
                    position = json.loads(position)
                except TypeError:
                    pass

                if text != '':
                    self.log.info('Invoice number found with position : ' + str(text))
                    return [text, position, data['page']]

        for line in self.text:
            for _invoice in re.finditer(r"" + self.regex['invoiceRegex'] + "", line.content.upper()):
                invoice_number = self.sanitize_invoice_number(_invoice.group())
                if len(invoice_number) >= int(self.configurations['invoiceSizeMin']):
                    self.log.info('Invoice number found : ' + invoice_number)
                    return [invoice_number, line.position, self.nbPages]

        for line in self.footer_text:
            for _invoice in re.finditer(r"" + self.regex['invoiceRegex'] + "", line.content.upper()):
                invoice_number = self.sanitize_invoice_number(_invoice.group())
                if len(invoice_number) >= int(self.configurations['invoiceSizeMin']):
                    self.log.info('Invoice number found : ' + invoice_number)
                    position = self.Files.return_position_with_ratio(line, 'footer')
                    return [invoice_number, position, self.nbPages]
