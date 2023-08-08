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
from src.backend.import_classes import _Files


class FindName:
    def __init__(self, ocr, log, docservers):
        self.ocr = ocr
        self.log = log
        self.nb_page = 1
        self.text = ocr.text
        self.names_list = []
        self.custom_page = False
        self.docservers = docservers
        self.footer_text = ocr.footer_text
        self.header_text = ocr.header_text

    def run(self):
        names_referential = self.docservers['REFERENTIALS_PATH'] + 'LISTE_PRENOMS.csv'
        with open(names_referential, 'r', encoding='UTF-8') as _f:
            for name in _f.readlines():
                name = name.strip()
                for line in self.text:
                    if name.lower() in line.content.lower():
                        civivity = re.findall(r"(Monsieur|MR|M\.|Mme|Mlle|Mle|Madame|Mademoiselle)", line.content, flags=re.IGNORECASE)
                        if civivity:
                            cpt = 0
                            splitted_line = line.content.split(' ')
                            for word in splitted_line:
                                firstname = lastname = None
                                if re.match(r"(Monsieur|MR|M\.|Mme|Mlle|Mle|Madame|Mademoiselle)", word, flags=re.IGNORECASE):
                                    if splitted_line[cpt + 1].lower() == name.lower():
                                        firstname = splitted_line[cpt + 1].capitalize()
                                        lastname = splitted_line[cpt + 2].capitalize()
                                    elif splitted_line[cpt + 2].lower() == name.lower():
                                        firstname = splitted_line[cpt + 2].capitalize()
                                        lastname = splitted_line[cpt + 1].capitalize()

                                if firstname and lastname:
                                    return [
                                        {'firstname': firstname, 'lastname': lastname},
                                        _Files.reformat_positions(line.position),
                                        self.nb_page
                                    ]
                                elif firstname:
                                    return [
                                        {'firstname': firstname},
                                        _Files.reformat_positions(line.position),
                                        self.nb_page
                                    ]
                                elif lastname:
                                    return [
                                        {'lastname': lastname},
                                        _Files.reformat_positions(line.position),
                                        self.nb_page
                                    ]
                                cpt += 1
