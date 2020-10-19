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

class FindSupplier:
    def __init__(self, Ocr, Log, Locale, Database, Files, nb_pages, custom_page):
        self.Ocr                = Ocr
        self.text               = Ocr.header_text
        self.Log                = Log
        self.Files              = Files
        self.Database           = Database
        self.Locale             = Locale
        self.OCRErrorsTable     = Ocr.OCRErrorsTable
        self.found_first        = True
        self.found_second       = True
        self.found_third        = True
        self.found_fourth       = True
        self.found_fifth        = True
        self.found_last_first   = True
        self.found_last_second  = True
        self.found_last_three   = True
        self.splitted           = False
        self.nbPages            = nb_pages
        self.tmpNbPages         = nb_pages
        self.customPage         = custom_page

    @staticmethod
    def validate_luhn(n):
        r = [int(ch) for ch in str(n)][::-1]
        return (sum(r[0::2]) + sum(sum(divmod(d * 2, 10)) for d in r[1::2])) % 10 == 0

    def process(self, regex, textAsString):
        arrayOfData = {}
        if textAsString and not self.splitted:
            self.text = self.text.split('\n')
            self.splitted = True

        for line in self.text:
            correctedLine = ''
            for item in self.OCRErrorsTable['NUMBERS']:
                pattern = r'[%s]' % self.OCRErrorsTable['NUMBERS'][item]
                if textAsString:
                    content = line
                else:
                    content = line.content
                correctedLine = re.sub(pattern, item, content)

            for _data in re.finditer(r"" + regex + "", correctedLine.replace(' ', '')):
                arrayOfData.update({_data.group(): line})

        if len(arrayOfData) != 0:
            return arrayOfData
        else:
            # If there is no regex found, return false
            return False

    def regenerateOcr(self):
        if self.Files.isTiff == 'True':
            self.Files.open_img(self.Files.tiffName_header)
        else:
            self.Files.open_img(self.Files.jpgName_header)

    def run(self, retry = False, regenerateOcr = False, target = None, textAsString = False):
        vatFound        = False
        siretFound      = False

        vatNumber = self.process(self.Locale.VATNumberRegex, textAsString)

        if vatNumber:
            for _vat in vatNumber:
                args = {
                    'select'    : ['*'],
                    'table'     : ['suppliers'],
                    'where'     : ['vat_number = ?'],
                    'data'      : [_vat]
                }
                existingSupplier = self.Database.select(args)
                if existingSupplier:
                    self.regenerateOcr()
                    self.Log.info('Supplier found : ' + existingSupplier[0]['name'] + ' using VAT Number : ' + _vat)
                    line     = vatNumber[_vat]
                    if textAsString:
                        position = (('',''),('',''))
                    else:
                        position = self.Files.returnPositionWithRatio(line, target)
                    data = [existingSupplier[0]['vat_number'], position, existingSupplier[0], self.nbPages]

                    return data
        siretNumber = False
        if not vatFound:
            siretNumber = self.process(self.Locale.SIRETRegex, textAsString)
            if siretNumber:
                for _siret in siretNumber:
                    if self.validate_luhn(_siret):
                        args = {
                            'select': ['*'],
                            'table' : ['suppliers'],
                            'where' : ['siret = ?'],
                            'data'  : [_siret]
                        }
                        existingSupplier = self.Database.select(args)
                        if existingSupplier:
                            self.regenerateOcr()
                            self.Log.info('Supplier found : ' + existingSupplier[0]['name'] + ' using SIRET : ' + _siret)
                            data = [existingSupplier[0]['vat_number'], (('', ''), ('', '')), existingSupplier[0], self.nbPages]

                            return data
                        else:
                            self.Log.info('SIRET found : ' + _siret + ' but no supplier found in database using this SIRET')
        if not siretFound:
            self.Log.info("SIRET not found or doesn't meet the Luhn's algorithm")
            sirenNumber = self.process(self.Locale.SIRENRegex, textAsString)
            if sirenNumber:
                for _siren in sirenNumber:
                    if self.validate_luhn(_siren):
                        args = {
                            'select': ['*'],
                            'table': ['suppliers'],
                            'where': ['SIREN = ?'],
                            'data': [_siren]
                        }
                        existingSupplier = self.Database.select(args)
                        if existingSupplier:
                            self.regenerateOcr()
                            self.Log.info('Supplier found : ' + existingSupplier[0]['name'] + ' using SIREN : ' + _siren)
                            data = [existingSupplier[0]['vat_number'], (('', ''), ('', '')), existingSupplier[0], self.nbPages]

                            return data
                        else:
                            if siretNumber:
                                for _siret in siretNumber:
                                    if self.validate_luhn(_siret):
                                        SIRENRegex  = self.Locale.SIRENRegex
                                        SIRENSize   = SIRENRegex[SIRENRegex.find('{') + 1:SIRENRegex.find("}")]
                                        SIREN       = _siret[:int(SIRENSize)]
                                        args        = {
                                            'select': ['*'],
                                            'table' : ['suppliers'],
                                            'where' : ['SIREN = ?'],
                                            'data'  : [SIREN]
                                        }
                                        existingSupplier = self.Database.select(args)
                                        if existingSupplier:
                                            self.regenerateOcr()
                                            self.Log.info('Supplier found : ' + existingSupplier[0]['name'] + ' using SIREN : ' + _siret)
                                            data = [existingSupplier[0]['vat_number'], (('', ''), ('', '')), existingSupplier[0], self.nbPages]

                                            return data
                self.Log.info("SIREN not found or doesn't meet the Luhn's algorithm")

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
                if self.tmpNbPages == 1:
                    return False
                self.found_last_first = False
            elif retry and not self.found_last_first and self.found_last_second:
                self.found_last_second = False
            elif retry and not self.found_last_second and self.found_last_three:
                self.found_last_three = False

            # If we had to change footer to header
            # Regenerator OCR with the full image content
            if regenerateOcr:
                self.regenerateOcr()
                return False  # Return False because if we reach this, all the possible tests are done. Mandatory to avoid infinite loop

        if self.customPage:
            self.Log.info('No supplier informations found in the first and last page. Try last page - 1')
            if self.Files.isTiff == 'True':
                file = self.Files.custom_fileName_tiff
            else:
                file = self.Files.custom_fileName
            image = self.Files.open_image_return(file)
            self.text = self.Ocr.line_box_builder(image)
            return self.run(retry=True, regenerateOcr = True, target = 'footer')

        # If NO supplier identification are found in the header (default behavior),
        # First apply image correction
        if not retry and not self.found_first:
            self.Log.info('No supplier informations found in the header, improve image and retry...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.tiffName_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_header)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            self.nbPages = 1
            return self.run(retry=True, target=None)

        # If, even with improved image, nothing was found, check the footer
        if retry and not self.found_second and self.found_third:
            self.Log.info('No supplier informations found with improved image, try with footer...')
            self.text = self.Ocr.footer_text
            self.nbPages = 1
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the footer,
        # Apply image improvment
        if retry and not self.found_third and self.found_fourth:
            self.Log.info('No supplier informations found in the footer, improve image and retry...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.tiffName_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            self.nbPages = 1
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the improved footer,
        # Try using another tesseract function to extract text on the header
        if retry and not self.found_fourth and self.found_fifth:
            self.Log.info('No supplier informations found in the footer, change Tesseract function to retrieve text and retry on header...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.tiffName_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_header)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.text_builder(self.Files.img)
            self.nbPages = 1
            return self.run(retry=True, target='header', textAsString=True)

        if retry and not self.found_fifth and self.found_last_first:
            self.splitted = False
            self.Log.info('No supplier informations found in the header as string, change Tesseract function to retrieve text and retry on footer...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.tiffName_footer)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.text_builder(self.Files.img)
            self.nbPages = 1
            return self.run(retry=True, target='footer', textAsString=True)

        # Try now with the last page
        if retry and not self.found_last_first and self.found_last_first:
            self.Log.info('No supplier informations found in the first page, try with the last page header')
            self.text = self.Ocr.header_last_text
            self.nbPages = self.tmpNbPages
            return self.run(retry=True, target = 'header')

        if retry and not self.found_last_first and self.found_last_second:
            self.Log.info('No supplier informations found in the header last page, try with the improved last page header')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.tiffName_last_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_last_header)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            self.nbPages = self.tmpNbPages
            return self.run(retry=True, target = 'header')

        if retry and not self.found_last_second and self.found_last_three:
            self.Log.info('No supplier informations found in the header last page, try with the footer last page header')
            self.text = self.Ocr.footer_last_text
            self.nbPages = self.tmpNbPages
            return self.run(retry=True, regenerateOcr = True, target = 'footer')

        self.Log.error('No supplier found...')
        return False