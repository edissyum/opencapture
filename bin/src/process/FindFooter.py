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
import operator

class FindFooter:
    def __init__(self, Ocr, Log, Locale, Config, Files, Database, supplier, file):
        self.date           = ''
        self.Ocr            = Ocr
        self.Log            = Log
        self.Locale         = Locale
        self.Config         = Config
        self.Files          = Files
        self.Database       = Database
        self.supplier       = supplier
        self.file           = file
        self.noRateAmount   = {}
        self.allRateAmount  = {}
        self.ratePercentage = {}

    def process(self, regex):
        arrayOfData = {}
        for line in self.Ocr.footer_text:
            for res in re.finditer(r"" + regex + "", line.content.upper()):
                # Retrieve only the number and add it in array
                # In case of multiple no rates amount found, take the higher
                tmp     = re.finditer(r'[-+]?\d*[.,]+\d+|\d+', res.group())
                result  = ''
                i = 0
                for t in tmp:
                    if ('.' in t.group() or ',' in t.group()) and i > 1:
                        # If two amounts are found, separate them
                        continue
                    result += re.sub('\s*', '', t.group()).replace(',', '.')
                    i = i + 1
                result_split    = result.split('.')
                if len(result_split)> 1:
                    result          = result_split[0] + '.' + result_split[1][0:2]
                arrayOfData.update({float(result.replace(',','.')) : self.Files.returnPositionWithRatio(line, 'footer')})

        # Check list of no rates amount and select the higher
        if len(arrayOfData) > 0:
            return arrayOfData
        else:
            return False

    def process_with_position(self, select):
        position = self.Database.select({
            'select': [select],
            'table' : ['suppliers'],
            'where' : ['vat_number = ?'],
            'data'  : [self.supplier[0]]
        })[0][select]

        if position:
            positionArray   = self.Ocr.prepare_ocr_on_fly(position)
            if self.Files.isTiff == 'True':
                text            = self.Files.ocr_on_fly(self.Files.jpgName_tiff, positionArray, self.Ocr)
            else:
                text            = self.Files.ocr_on_fly(self.Files.jpgName, positionArray, self.Ocr)

            # Filter the result to get only the digits
            text = re.finditer(r'[-+]?\d*[.,\s]+\d+|\d+', text)
            result = ''
            for t in text:
                result += re.sub('\s*', '', t.group())

            if result is not '':
                result      = float(result.replace(',', '.'))
                position    = {
                    0 : {0 : positionArray['x1'], 1 : positionArray['y1']},
                    1 : {0 : positionArray['x2'], 1 : positionArray['y2']}
                }
                return result, position

            else:
                return False
        else:
            return False

    def test_amount(self, noRateAmount, allRateAmount, ratePercentage):
        if noRateAmount     is False or \
           ratePercentage   is False:
                if self.supplier is not False:
                    self.Log.info('No amount or percentage found in footer, start searching with supplier position')
                    if noRateAmount is False:
                        noRateAmount    = self.process_with_position('no_taxes_1_position')
                        if noRateAmount:
                            self.Log.info('noRateAmount found with position')

                    if ratePercentage is False:
                        ratePercentage  = self.process_with_position('vat_1_position')
                        if ratePercentage:
                            self.Log.info('ratePercentage found with position')

                if noRateAmount and ratePercentage:
                    self.noRateAmount   = noRateAmount
                    self.ratePercentage = ratePercentage
                    return True

                elif noRateAmount is False or ratePercentage is False:
                    return False

        self.noRateAmount   = noRateAmount
        self.allRateAmount  = allRateAmount
        self.ratePercentage = ratePercentage

    def run(self):
        noRateAmount    = self.process(self.Locale.noRatesRegex)
        ratePercentage  = self.process(self.Locale.vatRateRegex)
        allRateAmount   = self.process(self.Locale.allRatesRegex)
        # Test all amounts. If some are false, try to search them with position. If not, pass
        if self.test_amount(noRateAmount, allRateAmount, ratePercentage) is not False:
            # First args is amount, second is position
            noRateAmount    = self.return_max(self.noRateAmount)
            allRateAmount   = self.return_max(self.allRateAmount)
            ratePercentage  = self.return_max(self.ratePercentage)

            if noRateAmount is False and allRateAmount and ratePercentage:
                noRateAmount    = [float("%.2f" % (float(allRateAmount[0]) / (1 + float(ratePercentage[0]))))]
            elif allRateAmount is False and noRateAmount and ratePercentage:
                allRateAmount   = [float("%.2f" % (float(noRateAmount[0]) + (float(noRateAmount[0]) * float(ratePercentage[0] / 100))))]
            elif ratePercentage is False and noRateAmount and allRateAmount:
                vatAmount       = float("%.2f" % (float(allRateAmount[0]) - float(noRateAmount[0])))
                ratePercentage  = [float(vatAmount) / float(noRateAmount[0])]

            # Test if the three var's are good by simple math operation
            # Round up value with 2 decimals
            total    = "%.2f" % (float(noRateAmount[0]) + (float(noRateAmount[0]) * float(ratePercentage[0]) / 100))

            if float(total) == float(allRateAmount[0]):
                self.Log.info('Footer informations found : [TOTAL : ' + str(total) + ' ] - [HT : ' + str(noRateAmount) + ' ] - [VATRATE : ' + str(ratePercentage[0] / 100) + ' ]')
                return noRateAmount, allRateAmount, ratePercentage
            else:
                return False
        else:
            return False

    @staticmethod
    def return_max(value):
        if value and isinstance(value, dict):
            result = float(max(value.items(), key=operator.itemgetter(0))[0]), max(value.items(), key=operator.itemgetter(0))[1]
        elif value:
            result = value
        else:
            result = False

        return result