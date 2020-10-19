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
from webApp.functions import search_by_positions, search_custom_positions


class FindInvoiceNumber:
    def __init__(self, Ocr, Files, Log, Locale, Config, Database, supplier, file, typo, text, nb_pages, custom_page):
        self.vatNumber      = ''
        self.Ocr            = Ocr
        self.text           = text
        self.Log            = Log
        self.Files          = Files
        self.Locale         = Locale
        self.Config         = Config
        self.supplier       = supplier
        self.Database       = Database
        self.typo           = typo
        self.file           = file
        self.nbPages        = nb_pages
        self.customPage     = custom_page

    def run(self):
        found = False
        if self.Files.isTiff == 'True':
            target = self.Files.tiffName_header
        else:
            target = self.Files.jpgName_header
        invoiceNumber = search_by_positions(self.supplier, 'invoice', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        if invoiceNumber and invoiceNumber[0]:
            return invoiceNumber

        for line in self.text:
            for _invoice in re.finditer(r"" + self.Locale.invoiceRegex + "", line.content.upper()):
                tmpInvoiceNumber    = re.sub(r"" + self.Locale.invoiceRegex[:-2] + "", '', _invoice.group()) # Delete the invoice keyword
                invoiceNumber       = tmpInvoiceNumber.lstrip().split(' ')[0]
                if len(invoiceNumber) > int(self.Locale.invoiceSizeMin):
                    self.Log.info('Invoice number found : ' + invoiceNumber)
                    return [invoiceNumber, line.position, self.nbPages]
                else:
                    found = False
                    
        if not found and self.supplier and not self.customPage:
            self.Log.info('Invoice number not found. Searching invoice number using position in database')
            position = self.Database.select({
                'select': ['invoice_number_position', 'invoice_number_page'],
                'table' : ['suppliers'],
                'where' : ['vat_number = ?'],
                'data'  : [self.supplier[0]]
            })[0]

            if position and position['invoice_number_position']:
                data = {'position': position['invoice_number_position'], 'regex': None, 'target': 'full', 'page': position['invoice_number_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)

                if text !='':
                    self.Log.info('Invoice number found with position : ' + text)
                    return [text, position, data['page']]
                else:
                    return False
            else:
                return False
        else:
            return False
