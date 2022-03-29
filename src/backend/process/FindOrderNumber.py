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
from ..functions import search_custom_positions, search_by_positions


class FindOrderNumber:
    def __init__(self, ocr, files, log, locale, config, database, supplier, file, typo, text, nb_pages, custom_page, docservers, target='header'):
        self.Ocr = ocr
        self.text = text
        self.log = log
        self.Files = files
        self.locale = locale
        self.config = config
        self.docservers = docservers
        self.supplier = supplier
        self.Database = database
        self.typo = typo
        self.file = file
        self.nbPages = nb_pages
        self.customPage = custom_page
        self.target = target

    def sanitize_order_number(self, data):
        order_res = data
        # If the regex return a date, remove it
        for _date in re.finditer(r"" + self.locale.date_regex + "", data):
            if _date.group():
                order_res = data.replace(_date.group(), '')

        # Delete the delivery number keyword
        tmp_order_number = re.sub(r"" + self.locale.order_number_regex[:-2] + "", '', order_res)
        order_number = tmp_order_number.lstrip().split(' ')[0]
        return order_number

    def run(self):
        if self.supplier:
            order_number = search_by_positions(self.supplier, 'order_number', self.Ocr, self.Files, self.Database)
            if order_number and order_number[0]:
                return order_number

        if self.supplier and not self.customPage:
            position = self.Database.select({
                'select': [
                    "positions ->> 'order_number' as order_number_position",
                    "pages ->> 'order_number' as order_number_page"
                ],
                'table': ['accounts_supplier'],
                'where': ['vat_number = %s', 'status <> %s'],
                'data': [self.supplier[0], 'DEL']
            })[0]

            if position and position['order_number_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['order_number_position'], 'regex': None, 'target': 'full', 'page': position['order_number_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.locale, self.file, self.docservers)

                try:
                    position = json.loads(position)
                except TypeError:
                    pass

                if text is not False:
                    for _order in re.finditer(r"" + self.locale.order_number_regex + "", str(text).upper()):
                        order_number = self.sanitize_order_number(_order.group())
                        if order_number != '':
                            self.log.info('Order number found with position : ' + str(order_number))
                            return [order_number, position, data['page']]
                    if text != "":
                        self.log.info('Order number found with position : ' + str(text))
                        return [text, position, data['page']]

        for line in self.text:
            for _order in re.finditer(r"" + self.locale.order_number_regex + "", line.content.upper()):
                order_number = self.sanitize_order_number(_order.group())
                if len(order_number) >= int(self.locale.invoice_size_min):
                    self.log.info('Order number found : ' + order_number)
                    position = line.position
                    if self.target != 'header':
                        position = self.Files.return_position_with_ratio(line, self.target)
                    return [order_number, position, self.nbPages]
        return False
