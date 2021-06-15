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
    def __init__(self, ocr, log, locale, config, files, database, supplier, file, text, typo, target='footer', nbPages=False):
        self.date = ''
        self.Ocr = ocr
        self.text = text
        self.tmp_text = text
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
        self.rerun = False
        self.rerun_as_text = False
        self.splitted = False
        self.nbPage = 1 if nbPages is False else nbPages
        self.target = target

    def process(self, regex, text_as_string):
        array_of_data = {}

        if text_as_string and not self.splitted:
            self.text = self.text.split('\n')
            self.splitted = True

        for line in self.text:
            if text_as_string:
                content = line
            else:
                content = line.content

            for res in re.finditer(r"" + regex + "", content.upper()):
                # Retrieve only the number and add it in array
                # In case of multiple no rates amount found, take the higher
                tmp = re.finditer(r'[-+]?\d*[.,]+\d+([.,]+\d+)?|\d+', res.group())
                result = ''
                i = 0
                for t in tmp:
                    if ('.' in t.group() or ',' in t.group()) and i > 1:
                        # If two amounts are found, separate them
                        continue
                    number_formatted = t.group()
                    if regex != self.Locale.vatRateRegex:
                        try:
                            text = t.group().replace(' ', '.')
                            text = text.replace('\x0c', '')
                            text = text.replace('\n', '')
                            text = text.replace(',', '.')
                            splitted_number = text.split('.')
                            if len(splitted_number) > 1:
                                last_index = splitted_number[len(splitted_number) - 1]
                                if len(last_index) > 2:
                                    number_formatted = text.replace('.', '')
                                else:
                                    splitted_number.pop(-1)
                                    number_formatted = ''.join(splitted_number) + '.' + last_index
                                    number_formatted = str(float(number_formatted))
                        except (ValueError, SyntaxError, TypeError):
                            pass

                    result += re.sub('\s*', '', number_formatted).replace(',', '.')
                    i = i + 1
                result_split = result.split('.')
                if len(result_split) > 1:
                    result = result_split[0] + '.' + result_split[1][0:2]

                if result:
                    if text_as_string:
                        array_of_data.update({float(result.replace(',', '.')): (('', ''), ('', ''))})
                    else:
                        array_of_data.update({float(result.replace(',', '.')): self.Files.return_position_with_ratio(line, self.target)})

        # Check list of no rates amount and select the higher
        if len(array_of_data) > 0:
            return array_of_data
        else:
            return False

    def process_footer_with_position(self, select):
        position = self.Database.select({
            'select': select,
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [self.supplier[0]]
        })[0]

        if position and position[select[0]] not in ['((,),(,))', 'NULL', None, '', False]:
            page = position[select[1]]
            if self.target == 'full':
                page = self.nbPage

            data = {'position': position[select[0]], 'regex': None, 'target': 'full', 'page': page}
            text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
            if text:
                try:
                    # Try if the return string could be convert to float
                    float(text)
                    result = text
                    if select[0] == 'vat_1_position':  # Fix if we retrieve 2000.0, or 200.0 instead of 20.0 for example
                        tva_amounts = eval(self.Locale.vatRateList)
                        _split = result.split('.')
                        if _split[1] == '0':
                            result = _split[0]

                        for tva in tva_amounts:
                            if str(tva) in str(result.replace(',', '.')):
                                result = str(tva)
                                break
                except (ValueError, SyntaxError, TypeError):
                    # If results isn't a float, transform it
                    text = re.finditer(r'[-+]?\d*[.,]+\d+([.,]+\d+)?|\d+', text)
                    result = ''
                    for t in text:
                        result += t.group()

                    if select[0] != 'vat_1_position':
                        try:
                            text = result.replace(' ', '.')
                            text = text.replace('\x0c', '')
                            text = text.replace('\n', '')
                            text = text.replace(',', '.')
                            splitted_number = text.split('.')
                            if len(splitted_number) > 1:
                                last_index = splitted_number[len(splitted_number) - 1]
                                if len(last_index) > 2:
                                    result = text.replace('.', '')
                                else:
                                    splitted_number.pop(-1)
                                    result = ''.join(splitted_number) + '.' + last_index
                                    result = str(float(result))
                        except (ValueError, SyntaxError, TypeError):
                            pass

                if result != '':
                    result = re.sub('\s*', '', result).replace(',', '.')
                    self.nbPage = data['page']
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
                if no_rate_amount in [False, None]:
                    no_rate_amount = self.process_footer_with_position(['no_taxes_1_position', 'footer_page'])
                    if no_rate_amount:
                        self.noRateAmount = no_rate_amount
                        self.Log.info('noRateAmount found with position : ' + str(no_rate_amount))

                if rate_percentage in [False, None]:
                    rate_percentage = self.process_footer_with_position(['vat_1_position', 'footer_page'])
                    if rate_percentage:
                        self.ratePercentage = rate_percentage
                        self.Log.info('ratePercentage found with position : ' + str(rate_percentage))

            if no_rate_amount and rate_percentage:
                self.noRateAmount = no_rate_amount
                self.ratePercentage = rate_percentage
                return True
            elif no_rate_amount and all_rate_amount:
                self.noRateAmount = no_rate_amount
                self.allRateAmount = all_rate_amount
                return True
            else:
                return False

        self.noRateAmount = no_rate_amount
        self.allRateAmount = all_rate_amount
        self.ratePercentage = rate_percentage

    def run(self, text_as_string=False):
        if self.Files.isTiff == 'True':
            target = self.Files.tiffName
        else:
            target = self.Files.jpgName
        all_rate = search_by_positions(self.supplier, 'ttc', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
        all_rate_amount = {}
        if all_rate and all_rate[0]:
            all_rate_amount = {
                0: re.sub(r"[^0-9\.]|\.(?!\d)", "", all_rate[0].replace(',', '.')),
                1: all_rate[1]
            }
        no_rate = search_by_positions(self.supplier, 'no_taxes', self.Config, self.Locale, self.Ocr, self.Files, target, self.typo)
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

        vat_amount = False

        if not self.test_amount(no_rate_amount, all_rate_amount, rate_percentage):
            no_rate_amount = self.process(self.Locale.noRatesRegex, text_as_string)
            rate_percentage = self.process(self.Locale.vatRateRegex, text_as_string)
            all_rate_amount = self.process(self.Locale.allRatesRegex, text_as_string)

        if all_rate_amount and no_rate_amount:
            vat_amount = float("%.2f" % (self.return_max(all_rate_amount)[0] - self.return_max(no_rate_amount)[0]))

        if all_rate_amount and vat_amount and not no_rate_amount:
            no_rate_amount = [float("%.2f" % self.return_max(all_rate_amount)[0] - self.return_max(vat_amount)[0]), (('', ''), ('', ''))]

        if all_rate_amount and rate_percentage and not no_rate_amount:
            no_rate_amount = [float("%.2f" % (self.return_max(all_rate_amount)[0] / (1 + float(self.return_max(rate_percentage)[0] / 100)))), (('', ''), ('', ''))]

        # Test all amounts. If some are false, try to search them with position. If not, pass
        if self.test_amount(no_rate_amount, all_rate_amount, rate_percentage) is not False:
            # First args is amount, second is position
            no_rate_amount = self.return_max(self.noRateAmount)
            all_rate_amount = self.return_max(self.allRateAmount)
            rate_percentage = self.return_max(self.ratePercentage)

            if no_rate_amount is False and all_rate_amount and rate_percentage:
                no_rate_amount = [float("%.2f" % (float(all_rate_amount[0]) / (1 + float(rate_percentage[0] / 100)))), (('', ''), ('', '')), True]
            elif all_rate_amount is False and no_rate_amount and rate_percentage:
                all_rate_amount = [float("%.2f" % (float(no_rate_amount[0]) + (float(no_rate_amount[0]) * float(float(rate_percentage[0]) / 100)))), (('', ''), ('', '')), True]
            elif rate_percentage is False and no_rate_amount and all_rate_amount:
                vat_amount = float("%.2f" % (float(all_rate_amount[0]) - float(no_rate_amount[0])))
                rate_percentage = [float("%.2f" % (float(vat_amount) / float(no_rate_amount[0]) * 100)), (('', ''), ('', '')), True]

            # Test if the three var's are good by simple math operation
            # Round up value with 2 decimals
            try:
                total = "%.2f" % (float(no_rate_amount[0]) + (float(no_rate_amount[0]) * float(rate_percentage[0]) / 100))
            except TypeError:
                return False

            if float(total) == float(all_rate_amount[0]):
                self.Log.info('Footer informations found : [TOTAL : ' + str(total) + '] - [HT : ' + str(no_rate_amount[0]) + '] - [VATRATE : ' + str(rate_percentage[0]) + ']')
                return [no_rate_amount, all_rate_amount, rate_percentage, self.nbPage, ["%.2f" % float(float(no_rate_amount[0]) * (float(rate_percentage[0]) / 100))]]
            elif float(all_rate_amount[0]) == float(vat_amount + no_rate_amount[0]):
                self.Log.info('Footer informations found : [TOTAL : ' + str(total) + '] - [HT : ' + str(no_rate_amount[0]) + '] - [VATRATE : ' + str(rate_percentage[0]) + ']')
                return [no_rate_amount, all_rate_amount, rate_percentage, self.nbPage, ["%.2f" % float(float(no_rate_amount[0]) * (float(rate_percentage[0]) / 100))]]
            else:
                return False
        else:
            if not self.rerun:
                self.rerun = True
                if self.Files.isTiff == 'True':
                    improved_image = self.Files.improve_image_detection(self.Files.tiffName_footer)
                else:
                    improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
                self.Files.open_img(improved_image)
                self.text = self.Ocr.line_box_builder(self.Files.img)
                return self.run()

            if self.rerun and not self.rerun_as_text:
                self.rerun_as_text = True
                self.text = self.Ocr.text_builder(self.Files.img)
                return self.run(text_as_string=True)
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
