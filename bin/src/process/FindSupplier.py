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
import fast_luhn as fl

class FindSupplier:
    def __init__(self, Ocr, Log, Locale, Database, Files, _file):
        self.Ocr            = Ocr
        self.text           = Ocr.header_text
        self.Log            = Log
        self.fileToProcess  = _file
        self.Files          = Files
        self.Database       = Database
        self.Locale         = Locale
        self.OCRErrorsTable = Ocr.OCRErrorsTable
        self.found_first    = True
        self.found_second   = True
        self.found_third    = True
        self.found_fourth   = True
        self.splitted       = False

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
            self.Files.open_img(self.Files.jpgName_tiff_header)
        else:
            self.Files.open_img(self.Files.jpgName_header)
        self.Ocr.line_box_builder(self.Files.img)

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
                    return existingSupplier[0]['vat_number'], position, existingSupplier[0]

        if not vatFound:
            siretNumber = self.process(self.Locale.SIRETRegex, textAsString)
            if siretNumber:
                for _siret in siretNumber:
                    if fl.validate(_siret):
                        args = {
                            'select': ['*'],
                            'table' : ['suppliers'],
                            'where' : ['siret = ?'],
                            'data'  : [_siret]
                        }
                        existingSupplier = self.Database.select(args)
                        if existingSupplier:
                            self.regenerateOcr()
                            self.Log.info('SIRET found : ' + _siret)
                            return existingSupplier[0]['vat_number'], (('',''),('','')), existingSupplier[0]
                        else:
                            self.Log.info('SIRET found : ' + _siret + ' but no supplier found in database using this SIRET')
        if not siretFound:
            self.Log.info("SIRET not found or doesn't meet the Luhn's algorithm")
            sirenNumber = self.process(self.Locale.SIRENRegex, textAsString)
            if sirenNumber:
                for _siren in sirenNumber:
                    if fl.validate(_siren):
                        args = {
                            'select': ['*'],
                            'table': ['suppliers'],
                            'where': ['SIREN = ?'],
                            'data': [_siren]
                        }
                        existingSupplier = self.Database.select(args)
                        if existingSupplier:
                            self.regenerateOcr()
                            self.Log.info('SIREN found : ' + _siren)

                            return existingSupplier[0]['vat_number'], (('', ''), ('', '')), existingSupplier[0]
                        else:
                            if siretNumber:
                                for _siret in siretNumber:
                                    if fl.validate(_siret):
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
                                            self.Log.info('SIREN found using SIRET base : ' + _siret)
                                            return existingSupplier[0]['vat_number'], (('', ''), ('', '')), existingSupplier[0]

                self.Log.info("SIREN not found or doesn't meet the Luhn's algorithm")
            if not retry:
                self.found_first = False
            elif retry and self.found_second:
                self.found_second = False
            elif retry and not self.found_second and self.found_third:
                self.found_third = False
            elif retry and not self.found_third:
                self.found_fourth = False

            # If we had to change footer to header
            # Regenerator OCR with the full image content
            if regenerateOcr:
                self.regenerateOcr()
                return False  # Return False because if we reach this, all the possible tests are done. Mandatory to avoid infinite loop

        # If NO supplier identification are found in the header (default behavior),
        # First apply image correction
        if not retry and not self.found_first:
            self.Log.info('No supplier informations found in the header, improve image and retry...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_tiff_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_header)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            return self.run(retry=True, target=None)

        # If, even with improved image, nothing was found, check the footer
        if retry and not self.found_second and self.found_third:
            self.Log.info('No supplier informations found with improved image, try with footer...')
            if self.Files.isTiff == 'True':
                self.Files.open_img(self.Files.jpgName_tiff_footer)
            else:
                self.Files.open_img(self.Files.jpgName_footer)

            self.text = self.Ocr.line_box_builder(self.Files.img)
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the footer,
        # Apply image improvment
        if retry and not self.found_third and self.found_fourth:
            self.Log.info('No supplier informations found in the footer, improve image and retry...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_tiff_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            return self.run(retry=True, target='footer')

        # If NO supplier identification are found in the improved footer,
        # Try using another tesseract function to extract text
        if retry and not self.found_fourth:
            self.Log.info('No supplier informations found in the footer, change Tesseract function to retrieve text and retry...')
            if self.Files.isTiff == 'True':
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_tiff_header)
            else:
                improved_image = self.Files.improve_image_detection(self.Files.jpgName_header)
            self.Files.open_img(improved_image)
            self.text = self.Ocr.text_builder(self.Files.img)
            return self.run(retry=True, regenerateOcr=True, target='header', textAsString=True)

        self.Log.error('No supplier found...')
        return False