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
from src.backend.import_classes import _Files
from src.backend.functions import search_by_positions, search_custom_positions


class FindName:
    def __init__(self, ocr, log, docservers, supplier, files, database, regex, form_id, file):
        self.ocr = ocr
        self.log = log
        self.nb_page = 1
        self.file = file
        self.files = files
        self.regex = regex
        self.text = ocr.text
        self.names_list = []
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.custom_page = False
        self.docservers = docservers
        self.footer_text = ocr.footer_text
        self.header_text = ocr.header_text

    def run(self):
        if self.supplier:
            firstname = lastname = None
            firstname_position = lastname_position = None

            firstname_search = search_by_positions(self.supplier, 'firstname', self.ocr, self.files, self.database,
                                                   self.form_id, self.log)
            if firstname_search and firstname_search[0]:
                firstname = firstname_search[0]
                firstname_position = json.loads(firstname_search[1])
                del firstname_position['ocr_from_user']

            lastname_search = search_by_positions(self.supplier, 'lastname', self.ocr, self.files, self.database,
                                                  self.form_id, self.log)
            if lastname_search and lastname_search[0]:
                lastname = lastname_search[0]
                lastname_position = json.loads(lastname_search[1])
                del lastname_position['ocr_from_user']

            if firstname and lastname:
                return [
                    {'firstname': firstname, 'lastname': lastname},
                    {
                        'firstname': _Files.reformat_positions(firstname_position),
                        'lastname': _Files.reformat_positions(lastname_position)
                    },
                    self.nb_page
                ]

            if not self.custom_page:
                firstname = lastname = None
                firstname_position = lastname_position = None

                position = self.database.select({
                    'select': [
                        "positions -> '" + str(self.form_id) + "' -> 'firstname' as firstname_position",
                        "pages -> '" + str(self.form_id) + "' -> 'firstname' as firstname_page",
                    ],
                    'table': ['accounts_supplier'],
                    'where': ['vat_number = %s', 'status <> %s'],
                    'data': [self.supplier[0], 'DEL']
                })[0]

                if position and position['firstname_position'] not in [False, 'NULL', '', None]:
                    data = {'position': position['firstname_position'], 'regex': None, 'target': 'full',
                            'page': position['firstname_page']}
                    text, position = search_custom_positions(data, self.ocr, self.files, self.regex, self.file,
                                                             self.docservers)
                    try:
                        position = json.loads(position)
                    except TypeError:
                        pass

                    if text != '':
                        firstname = text
                        firstname_position = position
                        del firstname_position['ocr_from_user']

                position = self.database.select({
                    'select': [
                        "positions -> '" + str(self.form_id) + "' -> 'lastname' as lastname_position",
                        "pages -> '" + str(self.form_id) + "' -> 'lastname' as lastname_page",
                    ],
                    'table': ['accounts_supplier'],
                    'where': ['vat_number = %s', 'status <> %s'],
                    'data': [self.supplier[0], 'DEL']
                })[0]

                if position and position['lastname_position'] not in [False, 'NULL', '', None]:
                    data = {'position': position['lastname_position'], 'regex': None, 'target': 'full',
                            'page': position['lastname_page']}
                    text, position = search_custom_positions(data, self.ocr, self.files, self.regex, self.file,
                                                             self.docservers)
                    try:
                        position = json.loads(position)
                    except TypeError:
                        pass

                    if text != '':
                        lastname = text
                        lastname_position = position
                        del lastname_position['ocr_from_user']

                if firstname and lastname:
                    return [
                        {'firstname': firstname, 'lastname': lastname},
                        {
                            'firstname': _Files.reformat_positions(firstname_position),
                            'lastname': _Files.reformat_positions(lastname_position)
                        },
                        self.nb_page
                    ]

        names_referential = self.docservers['REFERENTIALS_PATH'] + 'LISTE_PRENOMS.csv'
        with open(names_referential, 'r', encoding='UTF-8') as _f:
            for name in _f.readlines():
                name = name.strip()
                for line in self.text:
                    if name.lower() in line.content.lower():
                        civivity = re.findall(r"(Monsieur|MR|M\.|Mme|Mlle|Mle|Madame|Mademoiselle)", line.content,
                                              flags=re.IGNORECASE)
                        if civivity:
                            cpt = 0
                            splitted_line = line.content.split(' ')
                            for word in splitted_line:
                                firstname = lastname = None
                                if re.match(r"(Monsieur|MR|M\.|Mme|Mlle|Mle|Madame|Mademoiselle)", word,
                                            flags=re.IGNORECASE):
                                    if splitted_line[cpt + 1].lower() == name.lower():
                                        firstname = splitted_line[cpt + 1].capitalize()
                                        lastname = splitted_line[cpt + 2].capitalize()
                                    elif splitted_line[cpt + 2].lower() == name.lower():
                                        firstname = splitted_line[cpt + 2].capitalize()
                                        lastname = splitted_line[cpt + 1].capitalize()

                                if firstname and lastname:
                                    self.log.info('Firstname and lastname found : ' + firstname + ' ' + lastname)
                                    return [
                                        {'firstname': firstname, 'lastname': lastname},
                                        {
                                            'firstname': _Files.reformat_positions(line.position),
                                            'lastname': _Files.reformat_positions(line.position)
                                        },
                                        self.nb_page
                                    ]
                                elif firstname:
                                    self.log.info('Firstname found : ' + firstname)
                                    return [
                                        {'firstname': firstname},
                                        {'firstname': _Files.reformat_positions(line.position)},
                                        self.nb_page
                                    ]
                                elif lastname:
                                    self.log.info('Lastname found : ' + lastname)
                                    return [
                                        {'lastname': lastname},
                                        {'firstname': _Files.reformat_positions(line.position)},
                                        self.nb_page
                                    ]
                                cpt += 1
