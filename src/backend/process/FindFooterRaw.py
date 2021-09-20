# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import json
import re
import operator
from ..functions import search_by_positions, search_custom_positions


class FindFooterRaw:
    def __init__(self, ocr, log, locale, config, files, database, supplier, file, text, typo, target='footer', nb_pages=False):
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
        self.totalHT = {}
        self.totalTTC = {}
        self.vatRate = {}
        self.vatAmount = {}
        self.typo = typo
        self.rerun = False
        self.rerun_as_text = False
        self.splitted = False
        self.nbPage = 1 if nb_pages is False else nb_pages
        self.target = target
        self.isLastPage = False

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
            for res in re.finditer(r"" + regex + "", content.upper().replace(' ', '')):
                # Retrieve only the number and add it in array
                # In case of multiple no rates amount found, take the higher
                data = res.group()
                if regex == self.Locale.vatAmountRegex:
                    data = re.sub(r"" + self.Locale.vatAmountRegex[:-2] + "", '', res.group())  # Delete the delivery number keyword

                tmp = re.finditer(r'[-+]?\d*[.,]+\d+([.,]+\d+)?|\d+', data)
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
                    result = result.replace('-', '').replace('/', '').replace('(', '').replace(')', '')
                    if text_as_string:
                        array_of_data.update({float(result.replace(',', '.')): (('', ''), ('', ''))})
                    else:
                        array_of_data.update({float(result.replace(',', '.')): self.Files.return_position_with_ratio(line, self.target)})

        # Check list of no rates amount and select the higher
        if len(array_of_data) > 0:
            return array_of_data
        else:
            return False

    def process_footer_with_position(self, column, select):
        position = self.Database.select({
            'select': select,
            'table': ['accounts_supplier'],
            'where': ['vat_number = %s'],
            'data': [self.supplier[0]]
        })[0]

        if position and position[column + '_position'] not in ['((,),(,))', 'NULL', None, '', False]:
            page = position[column + '_page']
            if self.target == 'full':
                page = self.nbPage

            data = {'position': position[column + '_position'], 'regex': None, 'target': 'full', 'page': page}
            text, position = search_custom_positions(data, self.Ocr, self.Files, self.Locale, self.file, self.Config)
            if text:
                try:
                    # Try if the return string could be convert to float
                    float(text)
                    result = text
                    if select[0] == 'vat_1_position':  # Fix if we retrieve 2000.0, or 200.0 instead of 20.0 for example
                        tva_amounts = eval(self.Locale.vatRateList)
                        _split = result.split('.')
                        if len(_split) > 1:
                            if _split[1] == '0':
                                result = _split[0]

                        for tva in tva_amounts:
                            if str(tva) in str(result.replace(',', '.')):
                                result = str(tva)
                                break
                except (ValueError, SyntaxError, TypeError):
                    # If results isn't a float, transform it
                    text = re.finditer(r'[-+]?\d*[.,]+\d+([.,]+\d+)?|\d+', text.replace(' ', ''))
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
                    try:
                        position = json.loads(position)
                    except (TypeError, json.decoder.JSONDecodeError):
                        pass
                    return [result, position, data['page']]
                else:
                    return False
            else:
                return False
        else:
            return False

    def test_amount(self, total_ht, total_ttc, vat_rate, vat_amount):
        if total_ht in [False, None, {}] or vat_rate in [False, None, {}] or total_ttc in [False, None, {}] or vat_amount in [False, None, {}]:
            if self.supplier is not False:
                if total_ht in [False, None, {}]:
                    total_ht = self.process_footer_with_position('total_ht',
                                                                       ["positions ->> 'total_ht' as total_ht_position",
                                                                        "pages ->> 'footer' as total_ht_page"])
                    if total_ht:
                        self.totalHT = total_ht
                        self.Log.info('totalHT found with position : ' + str(total_ht))

                if vat_rate in [False, None, {}]:
                    vat_rate = self.process_footer_with_position('vat_rate',
                                                                        ["positions ->> 'vat_rate' as vat_rate_position",
                                                                         "pages ->> 'footer' as vat_rate_page"])
                    if vat_rate:
                        self.vatRate = vat_rate
                        self.Log.info('vatRate found with position : ' + str(vat_rate))

                if vat_amount in [False, None, 0, {}]:
                    vat_amount = self.process_footer_with_position('vat_amount',
                                                                        ["positions ->> 'vat_amount' as vat_amount_position",
                                                                         "pages ->> 'vat_amount' as vat_amount_page"])
                    if vat_amount:
                        self.vatAmount = vat_amount
                        self.Log.info('vatAmount found with position : ' + str(vat_amount))

                if total_ttc in [False, None, 0, {}]:
                    total_ttc = self.process_footer_with_position('total_ttc',
                                                                   ["positions ->> 'total_ttc' as total_ttc_position",
                                                                    "pages ->> 'total_ttc' as total_ttc_page"])
                    if total_ttc:
                        self.totalTTC = total_ttc
                        self.Log.info('totalTTC found with position : ' + str(total_ttc))

            if vat_amount:
                self.vatAmount = vat_amount
            if total_ttc:
                self.totalTTC = total_ttc
            if vat_rate:
                self.vatRate = vat_rate
            if total_ht:
                self.totalHT = total_ht

            if total_ht and vat_rate:
                self.totalHT = total_ht
                self.vatRate = vat_rate
                return True
            elif total_ht and total_ttc:
                self.totalHT = total_ht
                self.totalTTC = total_ttc
                return True
            else:
                return False

        self.totalHT = total_ht
        self.totalTTC = total_ttc
        self.vatRate = vat_rate
        self.vatAmount = vat_amount

    def run(self, text_as_string=False):
        total_ttc, total_ht, vat_rate, vat_amount = {}, {}, {}, {}
        if self.supplier:
            all_rate = search_by_positions(self.supplier, 'total_ttc', self.Ocr, self.Files, self.Database)
            if all_rate and all_rate[0]:
                total_ttc = {
                    0: re.sub(r"[^0-9\.]|\.(?!\d)", "", all_rate[0].replace(',', '.')),
                    1: all_rate[1]
                }
            no_rate = search_by_positions(self.supplier, 'total_ht', self.Ocr, self.Files, self.Database)
            if no_rate and no_rate[0]:
                total_ht = {
                    0: re.sub(r"[^0-9\.]|\.(?!\d)", "", no_rate[0].replace(',', '.')),
                    1: no_rate[1]
                }
            percentage = search_by_positions(self.supplier, 'vat_rate', self.Ocr, self.Files, self.Database)
            if percentage and percentage[0]:
                vat_rate = {
                    0: re.sub(r"[^0-9\.]|\.(?!\d)", "", percentage[0].replace(',', '.')),
                    1: percentage[1]
                }
            _vat_amount = search_by_positions(self.supplier, 'vat_amount', self.Ocr, self.Files, self.Database)
            if _vat_amount and _vat_amount[0]:
                vat_amount = {
                    0: re.sub(r"[^0-9\.]|\.(?!\d)", "", _vat_amount[0].replace(',', '.')),
                    1: _vat_amount[1]
                }

        if not self.test_amount(total_ht, total_ttc, vat_rate, vat_amount):
            total_ht = self.process(self.Locale.noRatesRegex, text_as_string)
            vat_rate = self.process(self.Locale.vatRateRegex, text_as_string)
            total_ttc = self.process(self.Locale.allRatesRegex, text_as_string)
            vat_amount = self.process(self.Locale.vatAmountRegex, text_as_string)

        # Test all amounts. If some are false, try to search them with position. If not, pass
        if self.test_amount(total_ht, total_ttc, vat_rate, vat_amount) is not False:
            total_ht = self.return_max(self.totalHT)
            total_ttc = self.return_max(self.totalTTC)
            vat_rate = self.return_max(self.vatRate)
            vat_amount = self.return_max(self.vatAmount)
            self.Log.info('Raw footer informations found : [TOTAL : ' + str(total_ttc[0]) + '] - [HT : ' + str(total_ht[0]) + '] - [VATRATE : ' + str(vat_rate[0]) + '] - [VAT AMOUNT : ' + str(vat_amount[0]) + ']')
            return [total_ht, total_ttc, vat_rate, self.nbPage, vat_amount]
        else:
            if not self.rerun:
                self.rerun = True
                if self.Files.isTiff == 'True':
                    if self.isLastPage:
                        improved_image = self.Files.improve_image_detection(self.Files.tiffName_last_footer)
                    else:
                        improved_image = self.Files.improve_image_detection(self.Files.tiffName_footer)
                else:
                    if self.isLastPage:
                        improved_image = self.Files.improve_image_detection(self.Files.jpgName_last_footer)
                    else:
                        improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
                self.Files.open_img(improved_image)
                self.text = self.Ocr.line_box_builder(self.Files.img)
                return self.run()

            if self.rerun and not self.rerun_as_text:
                self.rerun_as_text = True
                if self.Files.isTiff == 'True':
                    if self.isLastPage:
                        improved_image = self.Files.improve_image_detection(self.Files.tiffName_last_footer)
                    else:
                        improved_image = self.Files.improve_image_detection(self.Files.tiffName_footer)
                else:
                    if self.isLastPage:
                        improved_image = self.Files.improve_image_detection(self.Files.jpgName_last_footer)
                    else:
                        improved_image = self.Files.improve_image_detection(self.Files.jpgName_footer)
                self.Files.open_img(improved_image)
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
            result = ['', '']

        return result
