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

    def process(self, regex):
        arrayOfData = {}
        for line in self.text:
            correctedLine = ''
            for item in self.OCRErrorsTable['NUMBERS']:
                pattern = r'[%s]' % self.OCRErrorsTable['NUMBERS'][item]
                correctedLine = re.sub(pattern, item, line.content)

            for _data in re.finditer(r"" + regex + "", correctedLine.replace(' ', '')):
                arrayOfData.update({_data.group(): line})

        if len(arrayOfData) != 0:
            return arrayOfData
        else:
            # If there is no regex found, return false
            return False

    def regenerateOcr(self):
        self.Files.open_img(self.Files.jpgName_header)
        self.Ocr.line_box_builder(self.Files.img)

    def run(self, retry = False, regenerateOcr = False, target=False):
        found_first     = True
        found_second    = True
        vatFound        = False
        siretFound      = False

        vatNumber = self.process(self.Locale.VATNumberRegex)

        if vatNumber:
            for _vat in vatNumber:
                args = {
                    'select'    : ['*'],
                    'table'     : ['suppliers'],
                    'where'     : ['vatNumber = ?'],
                    'data'      : [_vat]
                }
                existingSupplier = self.Database.select(args)
                if existingSupplier:
                    self.regenerateOcr()
                    self.Log.info('Supplier found : ' + existingSupplier[0]['name'] + ' using VAT Number : ' + _vat)
                    line     = vatNumber[_vat]
                    position = self.Files.returnPositionWithRatio(line, target)
                    return existingSupplier[0]['vatNumber'], position, existingSupplier[0]

        if not vatFound:
            siretNumber = self.process(self.Locale.SIRETRegex)
            if siretNumber:
                for _siret in siretNumber:
                    if fl.validate(_siret):
                        args = {
                            'select': ['*'],
                            'table' : ['suppliers'],
                            'where' : ['SIRET = ?'],
                            'data'  : [_siret]
                        }
                        existingSupplier = self.Database.select(args)
                        if existingSupplier:
                            self.regenerateOcr()
                            self.Log.info('SIRET found : ' + _siret)
                            return existingSupplier[0]['vatNumber'], (('',''),('','')), existingSupplier[0]
                        else:
                            self.Log.info('SIRET found : ' + _siret + ' but no supplier found in database using this SIRET')
                    else:
                        self.Log.info("SIRET doesn't meet the Luhn's algorithm : " + _siret)

        if not siretFound:
            sirenNumber = self.process(self.Locale.SIRENRegex)
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

                            return existingSupplier[0]['vatNumber'], (('', ''), ('', '')), existingSupplier[0]
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
                                            return existingSupplier[0]['vatNumber'], (('', ''), ('', '')), existingSupplier[0]
                    else:
                        self.Log.info("SIREN doesn't meet the Luhn's algorithm : " + _siren)

            if not retry:
                found_first = False
            else:
                found_second = False

            # If we had to change footer to header
            # Regenerator OCR with the full image content
            if regenerateOcr:
                self.regenerateOcr()
                return False  # Return False because if we reach this, all the possible tests are done. Mandatory to avoid infinite loop

        # If NO supplier identification are found in the header (default behavior),
        # First apply image correction
        if not found_first:
            self.Files.improve_image_detection(self.Files.jpgName_header)
            self.Files.open_img(self.Files.jpgName_header)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            return self.run(retry=True, target='False')

        # If, even with improved image, nothing was found, check the footer
        if not found_second:
            self.Files.improve_image_detection(self.Files.jpgName_footer)
            self.Files.open_img(self.Files.jpgName_footer)
            self.text = self.Ocr.line_box_builder(self.Files.img)
            return self.run(retry=True, regenerateOcr=True, target='footer')

        return False