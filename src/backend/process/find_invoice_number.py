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


class FindInvoiceNumber:
    def __init__(self, ocr, files, log, regex, config, database, supplier, file, docservers, configurations, languages, form_id):
        self.ocr = ocr
        self.log = log
        self.file = file
        self.nb_page = 1
        self.files = files
        self.regex = regex
        self.text = ocr.text
        self.config = config
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.custom_page = False
        self.languages = languages
        self.docservers = docservers
        self.footer_text = ocr.footer_text
        self.header_text = ocr.header_text
        self.configurations = configurations

    def format_date(self, date, position, convert=False):
        if date:
            date = date.replace('1er', '01')  # Replace some possible inconvenient char
            date = date.replace(',', ' ')  # Replace some possible inconvenient char
            date = date.replace('/', ' ')  # Replace some possible inconvenient char
            date = date.replace('-', ' ')  # Replace some possible inconvenient char
            date = date.replace('.', ' ')  # Replace some possible inconvenient char
    
            regex = self.regex
            language = self.configurations['locale']
            if self.supplier and self.supplier[2]['document_lang']:
                language = self.supplier[2]['document_lang']
                if self.supplier[2]['document_lang'] != self.configurations['locale']:
                    _regex = self.database.select({
                        'select': ['regex_id', 'content'],
                        'table': ['regex'],
                        'where': ["lang in ('global', %s)"],
                        'data': [self.configurations['locale']],
                    })
                    if _regex:
                        regex = {}
                        for _r in _regex:
                            regex[_r['regex_id']] = _r['content']
    
            if convert:
                date_file = self.docservers['LOCALE_PATH'] + '/' + language + '.json'
                with open(date_file, encoding='UTF-8') as file:
                    _fp = json.load(file)
                    date_convert = _fp['dateConvert'] if 'dateConvert' in _fp else ''
                for key in date_convert:
                    for month in date_convert[key]:
                        if month.lower() in date.lower():
                            date = (date.lower().replace(month.lower(), key))
                            break
            try:
                # Fix to handle date with 2 digits year
                date = date.replace('  ', ' ')
                length_of_year = len(date.split(' ')[2])
                date_format = "%d %m %Y"
    
                for _l in self.languages:
                    if language == self.languages[_l]['lang_code']:
                        date_format = self.languages[_l]['date_format']
    
                if length_of_year == 2:
                    date_format = date_format.replace('%Y', '%y')
    
                date = datetime.strptime(date, date_format).strftime(regex['format_date'])
                # Check if the date of the document isn't too old. 62 (default value) is equivalent of 2 months
                today = datetime.now()
                doc_date = datetime.strptime(date, regex['format_date'])
                timedelta = today - doc_date

                if timedelta.days < 0:
                    date = False
                return date, position
            except (ValueError, IndexError) as _e:
                return False
        else:
            return False

    def sanitize_invoice_number(self, data):
        invoice_res = data
        # If the regex return a date, remove it
        for _date in re.finditer(r"" + self.regex['date'], data):
            if _date.group():
                date = self.format_date(_date.group(), (('', ''), ('', '')), True)
                if date and date[0]:
                    invoice_res = data.replace(_date.group(), '')

        # Delete the invoice keyword
        tmp_invoice_number = re.sub(r"" + self.regex['invoice_number'][:-2], '', invoice_res)
        invoice_number = tmp_invoice_number.lstrip().split(' ')[0]
        return invoice_number

    def run(self):
        if self.supplier:
            invoice_number = search_by_positions(self.supplier, 'invoice_number', self.ocr, self.files, self.database, self.form_id, self.log)
            if invoice_number and invoice_number[0]:
                return invoice_number

            if not self.custom_page:
                position = self.database.select({
                    'select': [
                        "positions -> '" + str(self.form_id) + "' -> 'invoice_number' as invoice_number_position",
                        "pages -> '" + str(self.form_id) + "' ->'invoice_number' as invoice_number_page"
                    ],
                    'table': ['accounts_supplier'],
                    'where': ['vat_number = %s', 'status <> %s'],
                    'data': [self.supplier[0], 'DEL']
                })[0]

                if position and position['invoice_number_position'] not in [False, 'NULL', '', None]:
                    data = {'position': position['invoice_number_position'], 'regex': None, 'target': 'full', 'page': position['invoice_number_page']}
                    text, position = search_custom_positions(data, self.ocr, self.files, self.regex, self.file, self.docservers)

                    try:
                        position = json.loads(position)
                        del position['ocr_from_user']
                    except TypeError:
                        pass

                    if text != '':
                        self.log.info('Invoice number found with position : ' + str(text))
                        return [text, position, data['page']]

        cpt = 0
        for text in [self.header_text, self.footer_text, self.text]:
            for line in text:
                for _invoice in re.finditer(r"" + self.regex['invoice_number'], line.content.upper()):
                    invoice_number = self.sanitize_invoice_number(_invoice.group())
                    if len(invoice_number) >= int(self.configurations['invoiceSizeMin']):
                        self.log.info('Invoice number found : ' + str(invoice_number))
                        position = line.position
                        if cpt == 1:
                            position = self.files.return_position_with_ratio(line, 'footer')
                        return [invoice_number, position, self.nb_page]
            cpt += 1
