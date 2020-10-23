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
from webApp.functions import search_by_positions, search_custom_positions


class FindFooter:
    def __init__(self, ocr, log, locale, config, files, database, supplier, file, text, typo):
        self.date = ''
        self.Ocr = ocr
        self.text = text
        self.Log = log
        self.Locale = locale
        self.Config = config
        self.Files = files
        self.Database = database
        self.supplier = supplier
        self.file = file
        self.noRateAmount = {}
        self.allRateAmount = {}
        self.ratePercentage = {}
        self.typo = typo

    def process(self, regex):
        array_of_data = {}
        for line in self.text:
            for res in re.finditer(r"" + regex + "", line.content.upper()):

                # Retrieve only the number and add it in array
                # In case of multiple no rates amount found, take the higher
                tmp = re.finditer(r'[-+]?\d*[.,]+\d+|\d+', res.group())
                result = ''
                i = 0
                for t in tmp:
                    if ('.' in t.group() or ',' in t.group()) and i > 1:
                        # If two amounts are found, separate them
                        continue
                    result += re.sub('\s*', '', t.group()).replace(',', '.')
                    i = i + 1
                result_split = result.split('.')
                if len(result_split) > 1:
                    result = result_split[0] + '.' + result_split[1][0:2]
                array_of_data.update({float(result.replace(',', '.')): self.Files.return_position_with_ratio(line, 'footer')})

        # Check list of no rates amount and select the higher
        if len(array_of_data) > 0:
            return array_of_data
        else:
            return False

    def process_with_position(self, select):
        position = self.Database.select({
            'select': select,
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [self.supplier[0]]
        })[0]

        if position and position[select[0]]:
            data = {'position': position[select[0]], 'regex': None, 'target': 'full', 'page': position[select[1]]}
            text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
            if text:
                # Filter the result to get only the digits
                text = re.finditer(r'[-+]?\d*[.,\s]+\d+|\d+', text)
                result = ''
                for t in text:
                    result += re.sub('\s*', '', t.group())

                if result != '':
                    result = float(result.replace(',', '.'))
                    return [result, position, data['page']]
                else:
                    return False
            else:
                return False
        else:
            return False

    def test_amount(self, no_rate_amount, all_rate_amount, rate_percentage):
        if no_rate_amount in [False, None] or rate_percentage in [False, None]:
            if self.supplier is not False:
                self.Log.info('No amount or percentage found in footer, start searching with supplier position')
                if no_rate_amount in [False, None]:
                    no_rate_amount = self.process_with_position(['no_taxes_1_position', 'footer_page'])
                    if no_rate_amount:
                        self.Log.info('noRateAmount found with position')

                if rate_percentage in [False, None]:
                    rate_percentage = self.process_with_position(['vat_1_position', 'footer_page'])
                    if rate_percentage:
                        self.Log.info('ratePercentage found with position')

            if no_rate_amount and rate_percentage:
                self.noRateAmount = no_rate_amount
                self.ratePercentage = rate_percentage
                return True

            elif no_rate_amount in [False, None] and rate_percentage in [False, None]:
                return False

        self.noRateAmount = no_rate_amount
        self.allRateAmount = all_rate_amount
        self.ratePercentage = rate_percentage

    def run(self):
        if self.Files.isTiff == 'True':
            target = self.Files.tiffName
        else:
            target = self.Files.jpgName
        all_rate = search_by_positions(self.supplier, 'total_amount', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        all_rate_amount = {}
        if all_rate and all_rate[0]:
            all_rate_amount = {
                0: re.sub(r"[^0-9\.]|\.(?!\d)", "", all_rate[0].replace(',', '.')),
                1: all_rate[1]
            }
        no_rate = search_by_positions(self.supplier, 'ht_amount', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        no_rate_amount = {}
        if no_rate and no_rate[0]:
            no_rate_amount = {
                0: re.sub(r"[^0-9\.]|\.(?!\d)", "", no_rate[0].replace(',', '.')),
                1: all_rate[1]
            }
        percentage = search_by_positions(self.supplier, 'rate_percentage', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        rate_percentage = {}
        if percentage and percentage[0]:
            rate_percentage = {
                0: re.sub(r"[^0-9\.]|\.(?!\d)", "", percentage[0].replace(',', '.')),
                1: all_rate[1]
            }

        if not self.test_amount(no_rate_amount, all_rate_amount, rate_percentage):
            no_rate_amount = self.process(self.Locale.noRatesRegex)
            rate_percentage = self.process(self.Locale.vatRateRegex)
            all_rate_amount = self.process(self.Locale.allRatesRegex)

        # Test all amounts. If some are false, try to search them with position. If not, pass
        if self.test_amount(no_rate_amount, all_rate_amount, rate_percentage) is not False:
            # First args is amount, second is position
            no_rate_amount = self.return_max(self.noRateAmount)
            all_rate_amount = self.return_max(self.allRateAmount)
            rate_percentage = self.return_max(self.ratePercentage)

            if no_rate_amount is False and all_rate_amount and rate_percentage:
                no_rate_amount = [float("%.2f" % (float(all_rate_amount[0]) / (1 + float(rate_percentage[0] / 100)))), (('', ''), ('', ''))]
            elif all_rate_amount is False and no_rate_amount and rate_percentage:
                all_rate_amount = [float("%.2f" % (float(no_rate_amount[0]) + (float(no_rate_amount[0]) * float(rate_percentage[0] / 100)))), (('', ''), ('', ''))]
            elif rate_percentage is False and no_rate_amount and all_rate_amount:
                vat_amount = float("%.2f" % (float(all_rate_amount[0]) - float(no_rate_amount[0])))
                rate_percentage = [float("%.2f" % (float(vat_amount) / float(no_rate_amount[0]) * 100)), (('', ''), ('', ''))]

            # Test if the three var's are good by simple math operation
            # Round up value with 2 decimals
            try:
                total = "%.2f" % (float(no_rate_amount[0]) + (float(no_rate_amount[0]) * float(rate_percentage[0]) / 100))
            except TypeError:
                return False

            if float(total) == float(all_rate_amount[0]):
                self.Log.info('Footer informations found : [TOTAL : ' + str(total) + '] - [HT : ' + str(no_rate_amount[0]) + '] - [VATRATE : ' + str(rate_percentage[0]) + ']')
                return [no_rate_amount, all_rate_amount, rate_percentage, 1]
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
