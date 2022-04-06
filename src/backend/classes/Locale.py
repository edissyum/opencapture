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


class Locale:
    def __init__(self, configurations, docservers, regex):
        self.locale = configurations['locale']
        self.regex = regex
        self.date_path = docservers['LOCALE_PATH']
        self.array_date = []
        self.format_date = ''
        self.date_time_format = ''
        self.invoice_size_min = ''
        self.vat_rate_list = ''

        with open(self.date_path + self.locale + '.json', encoding='UTF-8') as file:
            _fp = json.load(file)
            self.array_date = _fp['dateConvert'] if 'dateConvert' in _fp else ''
            self.format_date = _fp['formatDate'] if 'formatDate' in _fp else ''
            self.date_time_format = _fp['dateTimeFormat'] if 'dateTimeFormat' in _fp else ''
            self.invoice_size_min = _fp['invoiceSizeMin'] if 'invoiceSizeMin' in _fp else ''
            self.vat_rate_list = _fp['vatRateList'] if 'vatRateList' in _fp else ''

