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
from thefuzz import fuzz
from src.backend.import_classes import _Files
from src.backend.functions import search_by_positions, search_custom_positions


def find_without_civility(splitted_line, name):
    firstname = lastname = None
    if len(name) >= 4 and 2 <= len(splitted_line) <= 3:
        if fuzz.ratio(splitted_line[0].lower(), name.lower()) >= 85:
            firstname = splitted_line[0].title()
            lastname = splitted_line[1].title()
            if lastname.lower() in ['de', 'el', 'da', 'le'] and len(splitted_line) == 3:
                lastname += ' ' + splitted_line[2].title()
            if lastname.isnumeric() or firstname.isnumeric() or len(lastname) < 3 or len(firstname) < 3:
                lastname = None
                firstname = None
        elif fuzz.ratio(splitted_line[1].lower(), name.lower()) >= 85:
            firstname = splitted_line[1].title()
            lastname = splitted_line[0].title()
            if lastname.isnumeric() or firstname.isnumeric() or len(lastname) < 3 or len(firstname) < 3:
                lastname = None
                firstname = None
    return {'firstname': firstname, 'lastname': lastname}


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

    def return_results(self, firstname, lastname, line, is_footer=False, name=None):
        position = self.files.reformat_positions(line.position)
        if is_footer:
            position = self.files.return_position_with_ratio(line, 'footer')
            position = self.files.reformat_positions(position)

        if firstname and lastname:
            if lastname.isnumeric() or firstname.isnumeric() or len(lastname) < 3 or len(firstname) < 3:
                return False

            if name and firstname[:len(name)].lower() != name.lower():
                return False

            self.log.info('Firstname and lastname found : ' + firstname + ' ' + lastname)
            return [
                {'firstname': firstname, 'lastname': lastname},
                {
                    'firstname': position,
                    'lastname': position
                },
                self.nb_page
            ]
        elif firstname:
            self.log.info('Firstname found : ' + firstname)
            return [
                {'firstname': firstname},
                {'firstname': position},
                self.nb_page
            ]
        elif lastname:
            self.log.info('Lastname found : ' + lastname)
            return [
                {'lastname': lastname},
                {'lastname': position},
                self.nb_page
            ]
        return False

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
                        if 'ocr_from_user' in firstname_position:
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
                        if 'ocr_from_user' in lastname_position:
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
        text_cpt = 0
        for text in [self.text, self.header_text, self.footer_text]:
            with open(names_referential, 'r', encoding='UTF-8') as _f:
                for name in _f.readlines():
                    name = name.strip()
                    for line in text:
                        if name.lower() in line.content.lower():
                            fixed_line = re.sub(r"(:|/|!|\?|“|\"|')", '', line.content, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(M,)", 'M.', fixed_line, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(MR,)", 'MR.', fixed_line, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(MME,)", 'MME.', fixed_line, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(MLE,)", 'MLE.', fixed_line, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(MLLE,)", 'MLLE.', fixed_line, flags=re.IGNORECASE)
                            fixed_line = re.sub(r"(,)", '', fixed_line, flags=re.IGNORECASE)

                            civility_regex = r"(DOCTEUR|MONSIEUR|MR|M\.|MME|MLLE|MLE|MADAME|MADEMOISELLE|MR(/|-)MME|MME(/|-)MR|M)"
                            civility = re.findall(civility_regex, fixed_line, flags=re.IGNORECASE)
                            splitted_line = list(filter(None, fixed_line.split(' ')))

                            if civility:
                                cpt = 0
                                for word in splitted_line:
                                    firstname = lastname = None
                                    match_civility = re.match(r"^" + civility_regex + "$", word, flags=re.IGNORECASE)
                                    if match_civility:
                                        if len(splitted_line) > cpt + 2:
                                            if fuzz.ratio(splitted_line[cpt + 1].lower(), name.lower()) >= 85:
                                                firstname = splitted_line[cpt + 1].title()
                                                lastname = splitted_line[cpt + 2].title()
                                                if lastname.lower() in ['de', 'el', 'da', 'le'] and len(splitted_line) >= cpt + 3:
                                                    lastname += ' ' + splitted_line[cpt + 3].title()
                                            elif fuzz.ratio(splitted_line[cpt + 2].lower(), name.lower()) >= 85:
                                                firstname = splitted_line[cpt + 2].title()
                                                lastname = splitted_line[cpt + 1].title()
                                        res = self.return_results(firstname, lastname, line, text_cpt == 2, name)
                                        if res:
                                            print('1', text_cpt, splitted_line, name)
                                            return res
                                    else:
                                        res = find_without_civility(splitted_line, name)
                                        if res['firstname'] and res['lastname']:
                                            res = self.return_results(res['firstname'], res['lastname'], line,
                                                                      text_cpt == 2)
                                            if res:
                                                print('2', text_cpt, splitted_line, name)
                                                return res
                                    cpt += 1
                            else:
                                res = find_without_civility(splitted_line, name)
                                if res['firstname'] and res['lastname']:
                                    res = self.return_results(res['firstname'], res['lastname'], line, text_cpt == 2)
                                    if res:
                                        print('3', text_cpt, line.content, name)
                                        return res
            text_cpt += 1
