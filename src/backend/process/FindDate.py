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
from datetime import datetime
from ..functions import search_by_positions, search_custom_positions


class FindDate:
    def __init__(self, text, log, locale, config, files, ocr, supplier, typo, nb_pages, db, file, docservers):
        self.date = ''
        self.text = text
        self.log = log
        self.locale = locale
        self.config = config
        self.docservers = docservers
        self.Files = files
        self.Ocr = ocr
        self.supplier = supplier
        self.typo = typo
        self.nbPages = nb_pages
        self.db = db
        self.file = file
        self.maxTimeDelta = -1

    def format_date(self, date, position, convert=False):
        if date:
            date = date.replace('1er', '01')  # Replace some possible inconvenient char
            date = date.replace(',', ' ')  # Replace some possible inconvenient char
            date = date.replace('/', ' ')  # Replace some possible inconvenient char
            date = date.replace('-', ' ')  # Replace some possible inconvenient char
            date = date.replace('.', ' ')  # Replace some possible inconvenient char

            if convert:
                date_convert = self.locale.arrayDate
                for key in date_convert:
                    for month in date_convert[key]:
                        if month.lower() in date.lower():
                            date = (date.lower().replace(month.lower(), key))
                            break
            try:
                # Fix to handle date with 2 digits year
                length_of_year = len(date.split(' ')[2])
                if length_of_year == 2:
                    regex = self.locale.dateTimeFormat.replace('%Y', '%y')
                else:
                    regex = self.locale.dateTimeFormat

                date = datetime.strptime(date, regex).strftime(self.locale.formatDate)
                # Check if the date of the document isn't too old. 62 (default value) is equivalent of 2 months
                today = datetime.now()
                doc_date = datetime.strptime(date, self.locale.formatDate)
                timedelta = today - doc_date

                if int(self.maxTimeDelta) not in [-1, 0]:
                    if timedelta.days > int(self.maxTimeDelta) or timedelta.days < 0:
                        self.log.info("Date is older than " + str(self.maxTimeDelta) +
                                      " days or in the future : " + date)
                        date = False
                return date, position
            except (ValueError, IndexError):
                self.log.info("Date wasn't in a good format : " + date)
                return False
        else:
            return False

    def process(self, line, position):
        for _date in re.finditer(r"" + self.locale.dateRegex + "", line):
            date = self.format_date(_date.group(), position, True)
            if date and date[0]:
                self.date = date[0]
                return date
            return False

    def process_due_date(self, line, position):
        regex = self.locale.dueDateRegex + self.locale.dateRegex
        for _date in re.finditer(r"" + regex + "", line):
            for res in re.finditer(r"" + self.locale.dateRegex + "", line):
                date = self.format_date(res.group(), position, True)
                if date and date[0]:
                    self.log.info('Due date found : ' + str(date[0]))
                    return date
                return False

    def run(self):
        date, due_date = None, None
        if self.supplier:
            date = search_by_positions(self.supplier, 'invoice_date', self.Ocr, self.Files, self.db)
            due_date = search_by_positions(self.supplier, 'invoice_due_date', self.Ocr, self.Files, self.db)

        if self.supplier:
            position = self.db.select({
                'select': [
                    "positions ->> 'invoice_date' as invoice_date_position",
                    "positions ->> 'invoice_due_date' as invoice_due_date_position",
                    "pages ->> 'invoice_date' as invoice_date_page",
                    "pages ->> 'invoice_due_date' as invoice_due_date_page",
                ],
                'table': ['accounts_supplier'],
                'where': ['vat_number = %s', 'status <> %s'],
                'data': [self.supplier[0], 'DEL']
            })[0]
            if position and position['invoice_due_date_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['invoice_due_date_position'], 'regex': None, 'target': 'full', 'page': position['invoice_due_date_page']}
                _text, _position = search_custom_positions(data, self.Ocr, self.Files, self.locale, self.file, self.docservers)
                try:
                    _position = json.loads(_position)
                except TypeError:
                    pass
                if _text != '':
                    res = self.format_date(_text, _position, True)
                    if res:
                        due_date = [res[0], res[1]]
                        self.log.info('Due date found using position : ' + str(res[0]))

        if date and date[0]:
            res = self.format_date(date[0], date[1])
            if res:
                self.date = res[0]
                self.log.info('Date found using mask position : ' + str(res[0]))

                if len(date) == 3:
                    if due_date:
                        return [res[0], res[1], date[2], due_date]
                    return [res[0], res[1], date[2]]
                else:
                    return [res[0], res[1], '']

        if not due_date:
            for line in self.text:
                due_date = self.process_due_date(re.sub(r'(\d)\s+(\d)', r'\1\2', line.content.upper()), line.position)
                if due_date:
                    break

        if self.supplier:
            if position and position['invoice_date_position'] not in [False, 'NULL', '', None]:
                data = {'position': position['invoice_date_position'], 'regex': None, 'target': 'full', 'page': position['invoice_date_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.locale, self.file, self.docservers)
                if text != '':
                    res = self.format_date(text, position, True)
                    if res:
                        self.date = res[0]
                        self.log.info('Invoice date found using position : ' + str(res[0]))
                        return [self.date, position, data['page'], due_date]

        for line in self.text:
            res = self.process(line.content.upper(), line.position)
            if res:
                self.log.info('Invoice date found : ' + res[0])
                return [res[0], res[1], self.nbPages, due_date]

        for line in self.text:
            res = self.process(re.sub(r'(\d)\s+(\d)', r'\1\2', line.content), line.position)
            if not res:
                res = self.process(line.content, line.position)
                if res:
                    return [res[0], res[1], self.nbPages, due_date]
            else:
                return [res[0], res[1], self.nbPages, due_date]
