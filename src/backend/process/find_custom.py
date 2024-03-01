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
import math
import string
from src.backend.functions import search_custom_positions


def sanitize_keyword(data, regex):
    tmp_data = re.sub(r"" + regex, '', data, flags=re.IGNORECASE)
    data = tmp_data.lstrip()
    return data


def validate_adeli(unchecked_adeli):
    if len(unchecked_adeli) != 9:
        return False
    try:
        int(unchecked_adeli)
    except ValueError:
        return False

    numero = unchecked_adeli[:8]
    cle = unchecked_adeli[8:]

    if numero == '00000000':
        return True

    pos = 1
    cletmp = 0

    for num in reversed(numero):
        num = int(num)
        if pos % 2 != 0:
            num *= 2

        pos = pos + 1
        if num >= 10:
            cletmp += math.floor(num / 10)
            cletmp += num % 10
        else:
            cletmp += num
    tmp_cle = int(str(cletmp)[len(str(cletmp)) - 1])
    cle_final = 10 - tmp_cle
    if cle_final == 10:
        cle_final = 0
    if int(cle_final) == int(cle):
        return True
    return False


def validate_iban(unchecked_iban):
    letters = {ord(d): str(i) for i, d in enumerate(string.digits + string.ascii_uppercase)}
    unchecked_iban = re.sub(r"\s*", '', unchecked_iban)

    def _number_iban(iban):
        return (iban[4:] + iban[:4]).translate(letters)

    def generate_iban_check_digits(iban):
        number_iban = _number_iban(iban[:2] + '00' + iban[4:])
        return '{:0>2}'.format(98 - (int(number_iban) % 97))

    def valid_iban(iban):
        return int(_number_iban(iban)) % 97 == 1
    return generate_iban_check_digits(unchecked_iban) == unchecked_iban[2:4] and valid_iban(unchecked_iban)


class FindCustom:
    def __init__(self, log, regex, config, ocr, files, supplier, file, database, docservers, form_id,
                 custom_fields_to_find, custom_fields_regex):
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
        self.header_text = ocr.text
        self.footer_text = ocr.text
        self.docservers = docservers
        self.ocr_errors_table = ocr.ocr_errors_table
        self.custom_fields_regex = custom_fields_regex
        self.custom_fields_to_find = custom_fields_to_find

    def check_format(self, data, settings):
        match = True
        if settings['format'] == 'number_float':
            data = re.sub(r"\s*", '', data)
            match = re.match(r"^[0-9]+([,.][0-9]+)?$", data)

        if settings['format'] == 'amount':
            data = re.sub(r"\s*", '', data)
            match = re.match(r"^[0-9]+([,.][0-9]+)?(€+|\$+|£+|(EUR(OS)?)+)?$", data)

        if settings['format'] == 'date':
            match = re.match(r"" + self.regex['date'], data)

        if settings['format'] == 'lunh_algorithm':
            _r = [int(ch) for ch in str(data)][::-1]
            match = (sum(_r[0::2]) + sum(sum(divmod(d * 2, 10)) for d in _r[1::2])) % 10 == 0

        if settings['format'] == 'adeli':
            match = validate_adeli(data)

        if settings['format'] == 'iban':
            match = validate_iban(data)
            if not match:
                new_data = data[:-1]
                match = validate_iban(data[:-1])
                if match:
                    data = new_data

            if not match:
                new_data = re.sub(r"^ER", 'FR', data)
                match = validate_iban(new_data)
                if match:
                    data = new_data

        if not match:
            return False
        return data

    def process(self, data):
        for line in self.text:
            line = line.content
            if data['type'] == 'number':
                for item in self.ocr_errors_table['NUMBERS']:
                    pattern = f"[{self.ocr_errors_table['NUMBERS'][item]}]"
                    line = re.sub(pattern, item, line)
            else:
                line = line.upper()

            for res in re.finditer(r"" + data['regex'], line, re.IGNORECASE):
                return res.group()

    def run_using_positions_mask(self):
        data_to_return = {}
        if self.supplier:
            list_of_fields = self.database.select({
                'select': ['positions', 'regex', 'pages'],
                'table': ['positions_masks'],
                'where': ['supplier_id = %s', 'form_id = %s'],
                'data': [self.supplier[2]['supplier_id'], self.form_id]
            })
            if list_of_fields:
                list_of_fields = list_of_fields[0]
                for index in list_of_fields['positions']:
                    if 'custom_' in index:
                        index_id = int(index.replace('custom_', ''))
                        if self.custom_fields_to_find is False or \
                                (self.custom_fields_to_find and index_id in self.custom_fields_to_find):
                            _data = {
                                'position': list_of_fields['positions'][index],
                                'regex': list_of_fields['regex'][index] if index in list_of_fields['regex'] else '',
                                'target': 'full',
                                'page': list_of_fields['pages'][index] if index in list_of_fields['pages'] else ''
                            }

                            data, position = search_custom_positions(_data, self.ocr, self.files, self.regex, self.file,
                                                                     self.docservers)
                            if not data and index in list_of_fields['regex'] and \
                                    list_of_fields[index]['regex'] is not False:
                                data_to_return[index] = [self.process(list_of_fields[index]), position,
                                                         list_of_fields['pages'][index]]
                                if index in data_to_return and data_to_return[index][0]:
                                    data_to_return[index] = [data, position, list_of_fields['pages'][index]]
                            else:
                                data_to_return[index] = [data, position, list_of_fields['pages'][index]]

            if not self.custom_page:
                custom_with_position = self.database.select({
                    'select': [
                        "positions -> '" + str(self.form_id) + "' as positions"
                    ],
                    'table': ['accounts_supplier'],
                    'where': ['vat_number = %s', 'status <> %s'],
                    'data': [self.supplier[0], 'DEL']
                })

                if custom_with_position:
                    custom_with_position = custom_with_position[0]
                    if custom_with_position['positions']:
                        for field in custom_with_position['positions']:
                            if 'custom_' in field:
                                position = self.database.select({
                                    'select': [
                                        "positions -> '" + str(
                                            self.form_id) + "' -> '" + field + "' as custom_position",
                                        "pages -> '" + str(self.form_id) + "' -> '" + field + "' as custom_page"
                                    ],
                                    'table': ['accounts_supplier'],
                                    'where': ['vat_number = %s', 'status <> %s'],
                                    'data': [self.supplier[0], 'DEL']
                                })[0]

                                if position and position['custom_position'] not in [False, 'NULL', '', None]:
                                    data = {'position': position['custom_position'], 'regex': None, 'target': 'full',
                                            'page': position['custom_page']}
                                    text, position = search_custom_positions(data, self.ocr, self.files, self.regex,
                                                                             self.file, self.docservers)
                                    try:
                                        position = json.loads(position)
                                    except TypeError:
                                        pass

                                    if text is not False and text:
                                        custom_id = field.replace('custom_', '')
                                        custom = self.database.select({
                                            'select': ['label'],
                                            'table': ['custom_fields'],
                                            'where': ['id = %s'],
                                            'data': [custom_id]
                                        })
                                        custom_name = custom_id
                                        if custom:
                                            custom_name = custom[0]['label']
                                        self.log.info(custom_name + ' found with position : ' + str(text))
                                        data_to_return[field] = [text, position, data['page']]
        return data_to_return

    def run(self):
        cpt = 0
        regex_settings = json.loads(self.custom_fields_regex['regex_settings'])
        for text in [self.header_text, self.footer_text, self.text]:
            for line in text:
                if 'content' in regex_settings and regex_settings['content']:
                    upper_line = line.content.upper()
                    if 'remove_special_char' in regex_settings and regex_settings['remove_special_char']:
                        data_to_replace = r'[-()\#\\/@;:<>{}\]\[`+=~|!?€$%£*©™ÏÎ,]'
                        if regex_settings['format'] == 'date':
                            data_to_replace = r'[-()\#\\@;:<>{}\]\[`+=~|!?€$%£*©™ÏÎ,]'
                        if regex_settings['format'] == 'amount':
                            data_to_replace = r'[-()\#\\@;:<>{}\]\[`+=~|!?€$%£*©™ÏÎ]'

                        upper_line = re.sub(data_to_replace, '', upper_line)
                        upper_line = re.sub(r'\s+', ' ', upper_line)

                    for _data in re.finditer(r"" + regex_settings['content'], upper_line, flags=re.IGNORECASE):
                        data = _data.group()
                        if regex_settings['remove_keyword'] and regex_settings['remove_keyword_value']:
                            data = sanitize_keyword(_data.group(), regex_settings['remove_keyword_value'])

                        data = self.check_format(data, regex_settings)
                        if data:
                            if regex_settings['format'] == 'amount':
                                data = re.sub(r",", '.', data)

                            if 'remove_spaces' in regex_settings and regex_settings['remove_spaces']:
                                data = re.sub(r"\s*", '', data)
                            data = data.strip()

                            if 'char_min' in regex_settings and regex_settings['char_min']:
                                if len(data) < int(regex_settings['char_min']):
                                    self.log.info(f"Value found : '{data}' doesn\'t have the minimum of "
                                                  f"{regex_settings['char_min']} chars required ")
                                    continue

                            self.log.info(self.custom_fields_regex['label'] + ' found : ' + data)
                            position = line.position
                            if cpt == 1:
                                position = self.files.return_position_with_ratio(line, 'footer')
                            return [data, position, self.nb_page]
            cpt += 1
