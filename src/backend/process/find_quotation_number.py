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
from datetime import datetime
from src.backend.functions import search_by_positions, search_custom_positions


class FindQuotationNumber:
    def __init__(self, ocr, files, log, regex, config, database, supplier, file, docservers, configurations, form_id,
                 languages):
        self.ocr = ocr
        self.log = log
        self.file = file
        self.nb_page = 1
        self.files = files
        self.regex = regex
        self.config = config
        self.text = ocr.text
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.custom_page = False
        self.languages = languages
        self.docservers = docservers
        self.footer_text = ocr.footer_text
        self.header_text = ocr.header_text
        self.configurations = configurations

    def sanitize_quotation_number(self, data):
        quotation_res = data
        # If the regex return a date, remove it
        for _date in re.finditer(r"" + self.regex['date'] + "", data):
            if _date.group():
                replace_date = True
                try:
                    date = str(_date.group()).replace('  ', ' ')
                    length_of_year = len(date.split(' ')[2])
                    date_format = "%d %m %Y"

                    for _l in self.languages:
                        if self.configurations['locale'] == self.languages[_l]['lang_code']:
                            date_format = self.languages[_l]['date_format']

                    if length_of_year == 2:
                        date_format = date_format.replace('%Y', '%y')
                    date = datetime.strptime(date, date_format).strftime(self.regex['format_date'])
                    # Check if the date of the document isn't too old. 62 (default value) is equivalent of 2 months
                    today = datetime.now()
                    doc_date = datetime.strptime(date, self.regex['format_date'])
                    timedelta = today - doc_date

                    if int(self.configurations['timeDelta']) not in [-1, 0]:
                        if timedelta.days > int(self.configurations['timeDelta']) or timedelta.days < 0:
                            replace_date = False
                    if timedelta.days < 0:
                        replace_date = False
                except (ValueError, IndexError) as _e:
                    replace_date = False

                if replace_date:
                    quotation_res = data.replace(_date.group(), '')

        # Delete if mail
        for _mail in re.finditer(r"" + self.regex['email'] + "", quotation_res.lower()):
            for _order in re.finditer(r"" + self.regex['email'] + "", _mail.group().lower()):
                return ''

        # Delete the quotation keyword
        tmp_quotation_number = re.sub(r"" + self.regex['quotation_number'][:-2] + "", '', quotation_res)
        quotation_number = tmp_quotation_number.lstrip().split(' ')[0]

        return quotation_number

    def run(self):
        if self.supplier:
            quotation_number = search_by_positions(self.supplier, 'quotation_number', self.ocr, self.files, self.database, self.form_id, self.log)
            if quotation_number and quotation_number[0]:
                return quotation_number

            if not self.custom_page:
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

        cpt = 0
        for text in [self.header_text, self.footer_text, self.text]:
            for line in text:
                for _quotation in re.finditer(r"" + self.regex['quotation_number'] + "", line.content.upper()):
                    quotation_number = self.sanitize_quotation_number(_quotation.group())
                    if len(quotation_number) >= int(self.configurations['devisSizeMin']):
                        print(quotation_number)
                        self.log.info('Quotation number found : ' + quotation_number)
                        position = line.position
                        if cpt == 1:
                            position = self.files.return_position_with_ratio(line, 'footer')
                        return [quotation_number, position, self.nb_page]
            cpt += 1
