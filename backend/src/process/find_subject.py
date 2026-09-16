# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import re

def loop_find_subject(array, compile_pattern):
    """
    Simple loop to find subject when multiple subject are found

    :param array: Array of subject
    :param compile_pattern: Choose between subject of ref to choose between all the subject in array
    :return: Return the best subject, or None
    """
    pattern = re.compile(compile_pattern, flags=re.IGNORECASE)
    for value in array:
        if pattern.search(value):
            return value
    return None


class FindSubject:
    def __init__(self, ocr, log, regex, files, supplier, database, file, docservers, form_id):
        self.ocr = ocr
        self.log = log
        self.file = file
        self.nb_page = 1
        self.files = files
        self.regex = regex
        self.text = ocr.text
        self.form_id = form_id
        self.supplier = supplier
        self.database = database
        self.custom_page = False
        self.docservers = docservers
        self.current_text = None
        self.header_text = ocr.header_text
        self.footer_text = ocr.footer_text

    @staticmethod
    def merge_positions(position_a, position_b):
        x1 = min(position_a[0][0], position_b[0][0])
        y1 = min(position_a[0][1], position_b[0][1])
        x2 = max(position_a[1][0], position_b[1][0])
        y2 = max(position_a[1][1], position_b[1][1])
        return (x1, y1), (x2, y2)

    def process(self, line):
        subject_array = []
        for _subject in re.finditer(r"" + self.regex['subject'], line.content, flags=re.IGNORECASE):
            if len(_subject.group()) > 3:
                # Using the [:-2] to delete the ".*" of the regex
                # Useful to keep only the subject and delete the left part
                # (e.g : remove "Objet : " from "Objet : Candidature pour un emploi - Démo Salindres")
                subject_array.append(_subject.group())

        # If there is more than one subject found, prefer the "Object" one instead of "Ref"
        if len(subject_array) > 1:
            subject = loop_find_subject(subject_array, self.regex['subject_only'])
            if subject:
                subject = re.sub(r"^" + self.regex['subject_only'][:-2], '', subject, flags=re.IGNORECASE).strip()
            else:
                subject = loop_find_subject(subject_array, self.regex['ref_only'])
                if subject:
                    subject = re.sub(r"^" + self.regex['ref_only'][:-2], '', subject, flags=re.IGNORECASE).strip()
        elif len(subject_array) == 1:
            subject = re.sub(r"^" + self.regex['subject'][:-2], '', subject_array[0], flags=re.IGNORECASE).strip()
        else:
            subject = ''

        position = line.position
        if subject:
            subject = re.sub(r"(RE|TR|FW)\s*:", '', subject, flags=re.IGNORECASE).strip()
            subject, position = self.search_subject_second_line(subject, line)
        return subject, position

    def search_subject_second_line(self, subject, current_line):
        not_allowed_symbol = [':', '.']
        cpt = 0
        position = current_line.position
        if not subject:
            return None, position

        for line in self.current_text:
            if line:
                find = False
                if subject in line.content:
                    next_line = self.current_text[cpt + 1].content
                    next_line_pos = self.current_text[cpt + 1].position
                    if next_line:
                        for letter in next_line:
                            if letter in not_allowed_symbol:  # Check if the line doesn't contain some specific char
                                find = True
                                break

                        if find:
                            continue

                        first_char = next_line[0]
                        if first_char.lower() == first_char:  # Check if first letter of line is not an upper one
                            subject += ' ' + next_line
                            # Merge the two lines' boxes so the position covers the full width and height
                            position = self.merge_positions(line.position, next_line_pos)
                            break
                char_cpt = 0
                for char in subject:
                    if char in not_allowed_symbol:
                        subject = subject[:char_cpt]
                        break
                    char_cpt = char_cpt + 1
            cpt = cpt + 1
        return subject, position

    def run(self):
        cpt = 0
        for text in [self.header_text, self.text]:
            self.current_text = text
            for line in text:
                subject, position = self.process(line)
                if subject:
                    self.log.info('Subject found : ' + str(subject))
                    return [subject, position, self.nb_page]
            cpt += 1
