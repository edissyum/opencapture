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
from datetime import datetime
from webApp.functions import search_by_positions, search_custom_positions


class FindDate:
    def __init__(self, text, log, locale, config, files, ocr, supplier, typo, nb_pages, db, file):
        self.date = ''
        self.text = text
        self.Log = log
        self.Locale = locale
        self.Config = config
        self.Files = files
        self.Ocr = ocr
        self.supplier = supplier
        self.typo = typo
        self.nbPages = nb_pages
        self.db = db
        self.file = file

    def format_date(self, date, position, convert=False):
        date = date.replace('1er', '01')  # Replace some possible inconvenient char
        date = date.replace(',', ' ')  # Replace some possible inconvenient char
        date = date.replace('/', ' ')  # Replace some possible inconvenient char
        date = date.replace('-', ' ')  # Replace some possible inconvenient char
        date = date.replace('.', ' ')  # Replace some possible inconvenient char

        if convert:
            date_convert = self.Locale.arrayDate
            for key in date_convert:
                for month in date_convert[key]:
                    if month.lower() in date.lower():
                        date = (date.lower().replace(month.lower(), key))
                        break

        try:
            # Fix to handle date with 2 digits year
            length_of_year = len(date.split(' ')[2])
            if length_of_year == 2:
                regex = self.Locale.dateTimeFormat.replace('%Y', '%y')
            else:
                regex = self.Locale.dateTimeFormat

            date = datetime.strptime(date, regex).strftime(self.Locale.formatDate)

            # Check if the date of the document isn't too old. 62 (default value) is equivalent of 2 months
            today = datetime.now()
            doc_date = datetime.strptime(date, self.Locale.formatDate)
            timedelta = today - doc_date

            if int(self.Config.cfg['GLOBAL']['timedelta']) not in [-1, 0]:
                if timedelta.days > int(self.Config.cfg['GLOBAL']['timedelta']) or timedelta.days < 0:
                    self.Log.info("Date is older than " + str(self.Config.cfg['GLOBAL']['timedelta']) + " days or in the future : " + date)
                    date = False
            return date, position
        except (ValueError, IndexError):
            self.Log.info("Date wasn't in a good format : " + date)
            return False

    def process(self, line, position):
        for _date in re.finditer(r"" + self.Locale.dateRegex + "", line):  # The re.sub is useful to fix space between numerics
            date = self.format_date(_date.group(), position, True)
            if date and date[0]:
                self.date = date[0]
                self.Log.info('Date found : ' + str(date[0]))
                return date
            return False

    def process_due_date(self, line, position):
        regex = self.Locale.dueDateRegex + self.Locale.dateRegex
        for _date in re.finditer(r"" + regex + "", line):
            for res in re.finditer(r"" + self.Locale.dateRegex + "", line):
                date = self.format_date(res.group(), position, True)
                if date and date[0]:
                    self.Log.info('Due date found : ' + str(date[0]))
                    return date
                return False

    def run(self):
        if self.Files.isTiff == 'True':
            target = self.Files.tiffName_header
        else:
            target = self.Files.jpgName_header
        date = search_by_positions(self.supplier, 'date', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        if date and date[0]:
            res = self.format_date(date[0], date[1])
            if res:
                self.date = res[0]
                self.Log.info('Date found using mask position : ' + str(res[0]))

                if len(date) == 3:
                    return [res[0], res[1], date[2]]
                else:
                    return [res[0], res[1], '']

        if self.supplier:
            position = self.db.select({
                'select': ['invoice_date_position', 'invoice_date_page', 'due_date_position', 'due_date_page'],
                'table': ['suppliers'],
                'where': ['vat_number = ?'],
                'data': [self.supplier[0]]
            })[0]

            due_date = False

            if position and position['due_date_position']:
                data = {'position': position['due_date_position'], 'regex': None, 'target': 'full', 'page': position['due_date_page']}
                _text, _position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
                if _text != '':
                    res = self.format_date(_text, _position)
                    if res:
                        due_date = [res[0], res[1]]
                        self.Log.info('Due date found using position : ' + str(res[0]))

            if not due_date:
                for line in self.text:
                    due_date = self.process_due_date(re.sub(r'(\d)\s+(\d)', r'\1\2', line.content.upper()), line.position)
                    if due_date:
                        break

            if position and position['invoice_date_position']:
                data = {'position': position['invoice_date_position'], 'regex': None, 'target': 'full', 'page': position['invoice_date_page']}
                text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
                if text != '':
                    res = self.format_date(text, position)
                    if res:
                        self.date = res[0]
                        self.Log.info('Invoice date found using position : ' + str(res[0]))
                        return [self.date, position, data['page'], due_date]

        for line in self.text:
            res = self.process(line.content.upper(), line.position)
            if res:
                self.Log.info('Invoice date found : ' + res[0])
                return res

        for line in self.text:
            res = self.process(re.sub(r'(\d)\s+(\d)', r'\1\2', line.content), line.position)
            if not res:
                res = self.process(line.content, line.position)
                if res:
                    return [res[0], res[1], self.nbPages, due_date]
            else:
                return [res[0], res[1], self.nbPages, due_date]
