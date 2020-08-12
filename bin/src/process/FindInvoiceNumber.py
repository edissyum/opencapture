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
from webApp.functions import search_by_positions

class FindInvoiceNumber:
    def __init__(self, Ocr, Files, Log, Locale, Config, Database, supplier):
        self.vatNumber      = ''
        self.Ocr            = Ocr
        self.Log            = Log
        self.Files          = Files
        self.Locale         = Locale
        self.Config         = Config
        self.supplier       = supplier
        self.Database       = Database

    def run(self):
        found = False
        if self.Files.isTiff == 'True':
            target = self.Files.jpgName_tiff_header
        else :
            target = self.Files.jpgName_header
        invoiceNumber = search_by_positions(self.supplier, 'invoice', self.Config, self.Locale, self.Ocr, self.Files, target)
        if invoiceNumber and invoiceNumber[0]:
            return invoiceNumber
        for line in self.Ocr.header_text:
            for _invoice in re.finditer(r"" + self.Locale.invoiceRegex + "", line.content.upper()):
                tmpInvoiceNumber    = re.sub(r"" + self.Locale.invoiceRegex[:-2] + "", '', _invoice.group()) # Delete the invoice keyword
                invoiceNumber       = tmpInvoiceNumber.lstrip().split(' ')[0]
                if len(invoiceNumber) > int(self.Locale.invoiceSizeMin):
                    self.Log.info('Invoice number found : ' + invoiceNumber)
                    return invoiceNumber, line.position
                else:
                    found = False
                    
        if not found and self.supplier:
            self.Log.info('Invoice number not found. Searching invoice number using position in database')
            position = self.Database.select({
                'select': ['invoice_number_position'],
                'table' : ['suppliers'],
                'where' : ['vat_number = ?'],
                'data'  : [self.supplier[0]]
            })[0]['invoice_number_position']

            if position :
                positionArray   = self.Ocr.prepare_ocr_on_fly(position)
                if self.Files.isTiff == 'True':
                    text = self.Files.ocr_on_fly(self.Files.jpgName_tiff, positionArray, self.Ocr)
                else:
                    text = self.Files.ocr_on_fly(self.Files.jpgName, positionArray, self.Ocr)

                if text is not '':
                    self.Log.info('Invoice number found with position : ' + text)
                    return text, position
                else:
                    return False, False
            else:
                return False, False
        return False, False
