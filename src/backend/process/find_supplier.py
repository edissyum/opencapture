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
import string


def validate_luhn(_n):
    _r = [int(ch) for ch in str(_n)][::-1]
    return (sum(_r[0::2]) + sum(sum(divmod(d * 2, 10)) for d in _r[1::2])) % 10 == 0


def validate_iban(unchecked_iban):
    letters = {ord(d): str(i) for i, d in enumerate(string.digits + string.ascii_uppercase)}

    def _number_iban(iban):
        return (iban[4:] + iban[:4]).translate(letters)

    def generate_iban_check_digits(iban):
        number_iban = _number_iban(iban[:2] + '00' + iban[4:])
        return '{:0>2}'.format(98 - (int(number_iban) % 97))

    def valid_iban(iban):
        return int(_number_iban(iban)) % 97 == 1
    return generate_iban_check_digits(unchecked_iban) == unchecked_iban[2:4] and valid_iban(unchecked_iban)


class FindSupplier:
    def __init__(self, ocr, log, regex, database, files, nb_pages, current_page, custom_page):
        self.ocr = ocr
        self.text = ocr.header_text
        self.log = log
        self.files = files
        self.database = database
        self.regex = regex
        self.ocr_errors_table = ocr.ocr_errors_table
        self.found_first = True
        self.found_second = True
        self.found_third = True
        self.found_fourth = True
        self.found_fifth = True
        self.found_last_first = True
        self.found_last_second = True
        self.found_last_three = True
        self.splitted = False
        self.nb_pages = nb_pages
        self.tmp_nb_pages = nb_pages
        self.current_page = current_page
        self.custom_page = custom_page

    def search_suplier(self, column, data):
        if data:
            where = ["TRIM(REPLACE(" + column + ", ' ', '')) = %s", 'accounts_supplier.status NOT IN (%s)']
            _data = [data, 'DEL']
            if column.lower() in ['siret', 'siren']:
                if not validate_luhn(data):
                    return False
            elif column.lower() == 'iban':
                if not validate_iban(data):
                    return False
            if column.lower() == 'bic':
                where = ["TRIM(REPLACE(" + column + ", ' ', '')) = %s OR TRIM(REPLACE(" + column + ", ' ', '')) = %s", 'accounts_supplier.status NOT IN (%s)']
                _data = [data, data[:-3], 'DEL']

            args = {
                'select': ['accounts_supplier.id as supplier_id', '*'],
                'table': ['accounts_supplier', 'addresses'],
                'left_join': ['accounts_supplier.address_id = addresses.id'],
                'where': where,
                'data': _data
            }
            existing_supplier = self.database.select(args)
            if existing_supplier:
                return existing_supplier[0]
        return False

    def process(self, regex, text_as_string, column):
        if text_as_string and not self.splitted:
            self.text = self.text.split('\n')
            self.splitted = True

        for line in self.text:
            corrected_line = ''
            for item in self.ocr_errors_table['NUMBERS']:
                pattern = r'[%s]' % self.ocr_errors_table['NUMBERS'][item]
                if text_as_string:
                    content = line
                else:
                    content = line.content

                if corrected_line:
                    content = corrected_line

                if column not in ['bic', 'email']:
                    corrected_line = re.sub(pattern, item, content)
                else:
                    corrected_line = content

            if column == 'email':
                corrected_line_tmp = corrected_line.split(':')[1] if len(corrected_line.split(':')) >= 2 else corrected_line
                for _data in re.finditer(r"" + regex + "", corrected_line_tmp.replace(' ', '').replace(',', '').replace('(', '').replace(')', '')):
                    supplier = self.search_suplier(column, _data.group().replace(' ', ''))
                    if supplier:
                        return supplier, line

                for _data in re.finditer(r"" + regex + "", corrected_line.replace(' ', '').replace(',', '').replace('(', '').replace(')', '')):
                    supplier = self.search_suplier(column, _data.group().replace(' ', ''))
                    if supplier:
                        return supplier, line

            for _data in re.finditer(r"" + regex + "", corrected_line.replace('.', '').replace(',', '').replace('(', '').replace(')', '').replace('-', '')):
                supplier = self.search_suplier(column, _data.group().replace(' ', ''))
                if supplier:
                    return supplier, line

            for _data in re.finditer(r"" + regex + "", corrected_line.replace(' ', '').replace('.', '').replace(',', '').replace('(', '').replace(')', '').replace('-', '')):
                supplier = self.search_suplier(column, _data.group())
                if supplier:
                    return supplier, line

            for _data in re.finditer(r"" + regex + "", corrected_line.replace(' ', '').replace('.', '').replace(',', '').replace('(', '').replace(')', '')):
                supplier = self.search_suplier(column, _data.group())
                if supplier:
                    return supplier, line
        return []

    def regenerate_ocr(self):
        self.files.open_img(self.files.jpg_name_header)

    def run(self, retry=False, regenerate_ocr=False, target=None, text_as_string=False):
        supplier = self.process(self.regex['vat_number'], text_as_string, 'vat_number')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using VAT Number : ' + supplier[0]['vat_number'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'vat_number']
            return data

        supplier = self.process(self.regex['siret'], text_as_string, 'siret')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using SIRET : ' + supplier[0]['siret'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'siret']
            return data

        supplier = self.process(self.regex['siren'], text_as_string, 'siren')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using SIREN : ' + supplier[0]['siren'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'siren']
            return data

        supplier = self.process(self.regex['iban'], text_as_string, 'iban')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using IBAN : ' + supplier[0]['iban'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'iban']
            return data

        supplier = self.process(self.regex['email'], text_as_string, 'email')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using EMAIL : ' + supplier[0]['email'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'email']
            return data

        supplier = self.process(self.regex['duns'], text_as_string, 'duns')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using DUNS : ' + supplier[0]['duns'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'duns']
            return data

        supplier = self.process(self.regex['bic'], text_as_string, 'bic')
        if supplier:
            self.regenerate_ocr()
            self.log.info('Third-party account found : ' + supplier[0]['name'] + ' using BIC : ' + supplier[0]['bic'])
            line = supplier[1]
            if text_as_string:
                position = (('', ''), ('', ''))
            else:
                position = self.files.return_position_with_ratio(line, target)
            data = [supplier[0]['vat_number'], position, supplier[0], self.current_page, 'bic']
            return data
        else:
            if not retry:
                self.found_first = False
            elif retry and self.found_second:
                self.found_second = False
            elif retry and not self.found_second and self.found_third:
                self.found_third = False
            elif retry and not self.found_third and self.found_fourth:
                self.found_fourth = False
            elif retry and not self.found_fourth and self.found_fifth:
                self.found_fifth = False
            elif retry and not self.found_fifth and self.found_last_first:
                if self.tmp_nb_pages == 1:
                    return False
                self.found_last_first = False
            elif retry and not self.found_last_first and self.found_last_second:
                self.found_last_second = False
            elif retry and not self.found_last_second and self.found_last_three:
                self.found_last_three = False

            # If we had to change footer to header
            # Regenerator OCR with the full image content
            if regenerate_ocr:
                self.regenerate_ocr()
                return False  # Return False because if we reach this, all the possible tests are done. Mandatory to avoid infinite loop

        if self.custom_page:
            self.log.info('No supplier informations found in the first and last page. Try last page - 1')
            file = self.files.custom_file_name
            image = self.files.open_image_return(file)
            self.text = self.ocr.line_box_builder(image)
            return self.run(retry=True, regenerate_ocr=True, target='footer')

        # If NO supplier identification are found in the header (default behavior),
        # First apply image correction
        if not retry and not self.found_first:
            self.log.info('No supplier informations found in the header, improve image and retry...')
            improved_image = self.files.improve_image_detection(self.files.jpg_name_header)
            self.files.open_img(improved_image)
            self.text = self.ocr.line_box_builder(self.files.img)
            return self.run(retry=True, target=None)

        # If, even with improved image, nothing was found, check the footer
        if retry and not self.found_second and self.found_third:
            self.log.info('No supplier informations found with improved image, try with footer...')
            self.text = self.ocr.footer_text
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the footer,
        # Apply image improvment
        if retry and not self.found_third and self.found_fourth:
            self.log.info('No supplier informations found in the footer, improve image and retry...')
            improved_image = self.files.improve_image_detection(self.files.jpg_name_footer)
            self.files.open_img(improved_image)
            self.text = self.ocr.line_box_builder(self.files.img)
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the improved footer,
        # Try using another tesseract function to extract text on the header
        if retry and not self.found_fourth and self.found_fifth:
            self.log.info('No supplier informations found in the footer, change Tesseract function to retrieve text and retry on header...')
            improved_image = self.files.improve_image_detection(self.files.jpg_name_header)
            self.files.open_img(improved_image)
            self.text = self.ocr.text_builder(self.files.img)
            return self.run(retry=True, target='header', text_as_string=True)

        if retry and not self.found_fifth and self.found_last_first:
            self.splitted = False
            self.log.info('No supplier informations found in the header as string, change Tesseract function to retrieve text and retry on footer...')
            improved_image = self.files.improve_image_detection(self.files.jpg_name_footer)
            self.files.open_img(improved_image)
            self.text = self.ocr.text_builder(self.files.img)
            self.current_page = 1
            return self.run(retry=True, target='footer', text_as_string=True)

        # Try now with the last page
        if retry and not self.found_last_first and self.found_last_second:
            self.log.info('No supplier informations found in the first page, try with the last page header')
            self.text = self.ocr.header_last_text
            self.current_page = self.nb_pages  # Use the last page number because we search on the last page
            return self.run(retry=True, target='header')

        if retry and not self.found_last_second and self.found_last_three:
            self.log.info('No supplier informations found in the header last page, try with the improved last page header')
            improved_image = self.files.improve_image_detection(self.files.jpg_name_last_header)
            self.files.open_img(improved_image)
            self.text = self.ocr.line_box_builder(self.files.img)
            self.current_page = self.nb_pages
            return self.run(retry=True, target='header')

        if retry and not self.found_last_three:
            self.log.info('No supplier informations found in the header last page, try with the footer last page header')
            self.text = self.ocr.footer_last_text
            self.current_page = self.nb_pages
            return self.run(retry=True, regenerate_ocr=True, target='footer')

        self.log.info('No third-party account found...')
        return False
