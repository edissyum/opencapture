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
from src.backend.functions import search_custom_positions


def sanitize_keyword(data, regex):
    tmp_data = re.sub(r"" + regex[:-2], '', data, flags=re.IGNORECASE)
    data = tmp_data.lstrip()
    return data


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

    def check_format_and_clean(self, data, settings):
        if 'remove_special_char' in settings and settings['remove_special_char']:
            data_to_replace = r'[-()\"#\\/@;:<>{}\]\[`+=~|!?€$%£*©™]'
            if settings['format'] == 'date':
                data_to_replace = r'[-()\"#\\@;:<>{}\]\[`+=~|!?€$%£*©™]'
            data = re.sub(data_to_replace, '', data)

        match = True
        if settings['format'] == 'number_float':
            data = re.sub(r"\s*", '', data)
            match = re.match(r"^[0-9]+([,.][0-9]+)?$", data)

        if settings['format'] == 'date':
            match = re.match(r"" + self.regex['date'], data)

        if match is None:
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
                                        "positions -> '" + str(self.form_id) + "' -> '" + field + "' as custom_position",
                                        "pages -> '" + str(self.form_id) + "' -> '" + field + "' as custom_page"
                                    ],
                                    'table': ['accounts_supplier'],
                                    'where': ['vat_number = %s', 'status <> %s'],
                                    'data': [self.supplier[0], 'DEL']
                                })[0]

                                if position and position['custom_position'] not in [False, 'NULL', '', None]:
                                    data = {'position': position['custom_position'], 'regex': None, 'target': 'full',
                                            'page': position['custom_page']}
                                    text, position = search_custom_positions(data, self.ocr, self.files, self.regex, self.file, self.docservers)
                                    try:
                                        position = json.loads(position)
                                    except TypeError:
                                        pass

                                    if text is not False and text:
                                        self.log.info(field + ' found with position : ' + str(text))
                                        data_to_return[field] = [text, position, data['page']]
        return data_to_return

    def run(self):
        cpt = 0
        for text in [self.header_text, self.footer_text, self.text]:
            for line in text:
                regex_settings = json.loads(self.custom_fields_regex['regex_settings'])
                if 'content' in regex_settings and regex_settings['content']:
                    for _data in re.finditer(r"" + regex_settings['content'], line.content.upper(),
                                             flags=re.IGNORECASE):
                        data = _data.group()

                        if regex_settings['remove_keyword']:
                            data = sanitize_keyword(_data.group(), regex_settings['content'])

                        data = self.check_format_and_clean(data, regex_settings)
                        if data:
                            if 'remove_spaces' in regex_settings and regex_settings['remove_spaces']:
                                data = re.sub(r"\s*", '', data)
                            self.log.info(self.custom_fields_regex['label'] + ' found : ' + data)
                            position = line.position
                            if cpt == 1:
                                position = self.files.return_position_with_ratio(line, 'footer')
                            return [data, position, self.nb_page]
            cpt += 1
