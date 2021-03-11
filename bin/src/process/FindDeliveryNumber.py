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


class FindDeliveryNumber:
    def __init__(self, ocr, files, log, locale, config, database, supplier, file, typo, text, nb_pages, custom_page):
        self.vatNumber = ''
        self.Ocr = ocr
        self.text = text
        self.Log = log
        self.Files = files
        self.Locale = locale
        self.Config = config
        self.supplier = supplier
        self.Database = database
        self.typo = typo
        self.file = file
        self.nbPages = nb_pages
        self.customPage = custom_page

    def run(self):
        found = False
        if self.supplier and not self.customPage:
            position = self.Database.select({
                'select': ['delivery_number_1_position'],
                'table': ['suppliers'],
                'where': ['vat_number = ?'],
                'data': [self.supplier[0]]
            })[0]

            if position and position['delivery_number_1_position']:
                data = {'position': position['delivery_number_1_position'], 'regex': None, 'target': 'full', 'page': '1'}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)

                if text != '':
                    self.Log.info('Delivery number found with position : ' + text)
                    return [text, position, data['page']]

        if not found:
            for line in self.text:
                for _delivery in re.finditer(r"" + self.Locale.deliveryNumberRegex + "", line.content.upper()):
                    delivery_res = _delivery.group()

                    # If the regex return a date, remove it
                    for _date in re.finditer(r"" + self.Locale.dateRegex + "", _delivery.group()):
                        if _date.group():
                            delivery_res = _delivery.group().replace(_date.group(), '')

                    tmp_delivery_number = re.sub(r"" + self.Locale.deliveryNumberRegex[:-2] + "", '', delivery_res)  # Delete the delivery number keyword
                    delivery_number = tmp_delivery_number.lstrip().split(' ')[0]

                    if len(delivery_number) >= int(self.Locale.invoiceSizeMin):
                        self.Log.info('Delivery number found : ' + delivery_number)
                        return [delivery_number, line.position, self.nbPages]
                    else:
                        return False
        else:
            return False
