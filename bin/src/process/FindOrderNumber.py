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


class FindOrderNumber:
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
                'select': ['order_number_1_position'],
                'table': ['suppliers'],
                'where': ['vat_number = ?'],
                'data': [self.supplier[0]]
            })[0]

            if position and position['order_number_1_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['order_number_1_position'], 'regex': None, 'target': 'full', 'page': '1'}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
                if text is not False:
                    for _order in re.finditer(r"" + self.Locale.orderNumberRegex + "", str(text).upper()):
                        order_res = _order.group()
                        # If the regex return a date, remove it
                        for _date in re.finditer(r"" + self.Locale.dateRegex + "", _order.group()):
                            if _date.group():
                                order_res = _order.group().replace(_date.group(), '')

                        tmp_order_number = re.sub(r"" + self.Locale.orderNumberRegex[:-2] + "", '', order_res)  # Delete the delivery number keyword
                        order_number = tmp_order_number.lstrip().split(' ')[0]

                        if order_number != '':
                            self.Log.info('Order number found with position : ' + str(order_number))
                            return [order_number, position, data['page']]
                    if text != "":
                        self.Log.info('Order number found with position : ' + str(text))
                        return [text, position, data['page']]

        if not found:
            for line in self.text:
                for _order in re.finditer(r"" + self.Locale.orderNumberRegex + "", line.content.upper()):
                    order_res = _order.group()

                    # If the regex return a date, remove it
                    for _date in re.finditer(r"" + self.Locale.dateRegex + "", _order.group()):
                        if _date.group():
                            order_res = _order.group().replace(_date.group(), '')

                    tmp_order_number = re.sub(r"" + self.Locale.orderNumberRegex[:-2] + "", '', order_res)  # Delete the delivery number keyword
                    order_number = tmp_order_number.lstrip().split(' ')[0]

                    if len(order_number) >= int(self.Locale.invoiceSizeMin):
                        self.Log.info('Order number found : ' + order_number)
                        return [order_number, line.position, self.nbPages]
                    else:
                        return False
        else:
            return False
