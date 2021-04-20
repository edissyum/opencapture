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

import json


class Locale:
    def __init__(self, config):
        self.locale = config.cfg['LOCALE']['locale']
        self.localeOCR = config.cfg['LOCALE']['localeocr']
        self.date_path = config.cfg['LOCALE']['localepath']
        self.arrayDate = []
        self.dateRegex = ''
        self.dueDateRegex = ''
        self.formatDate = ''
        self.SIRETRegex = ''
        self.SIRENRegex = ''
        self.VATNumberRegex = ''
        self.dateTimeFormat = ''
        self.invoiceRegex = ''
        self.invoiceSizeMin = ''
        self.allRatesRegex = ''
        self.noRatesRegex = ''
        self.vatRateRegex = ''
        self.deliveryNumberRegex = ''
        self.orderNumberRegex = ''
        self.vatRateList = ''

        with open(self.date_path + self.locale + '.json') as file:
            fp = json.load(file)
            self.arrayDate = fp['dateConvert'] if 'dateConvert' in fp else ''
            self.dateRegex = fp['dateRegex'] if 'dateRegex' in fp else ''
            self.dueDateRegex = fp['dueDateRegex'] if 'dueDateRegex' in fp else ''
            self.VATNumberRegex = fp['VATNumberRegex'] if 'VATNumberRegex' in fp else ''
            self.formatDate = fp['formatDate'] if 'formatDate' in fp else ''
            self.dateTimeFormat = fp['dateTimeFormat'] if 'dateTimeFormat' in fp else ''
            self.SIRETRegex = fp['SIRETRegex'] if 'SIRETRegex' in fp else ''
            self.SIRENRegex = fp['SIRENRegex'] if 'SIRENRegex' in fp else ''
            self.invoiceRegex = fp['invoiceRegex'] if 'invoiceRegex' in fp else ''
            self.invoiceSizeMin = fp['invoiceSizeMin'] if 'invoiceSizeMin' in fp else ''
            self.allRatesRegex = fp['allRatesRegex'] if 'allRatesRegex' in fp else ''
            self.noRatesRegex = fp['noRatesRegex'] if 'noRatesRegex' in fp else ''
            self.vatRateRegex = fp['vatRateRegex'] if 'vatRateRegex' in fp else ''
            self.deliveryNumberRegex = fp['deliveryNumberRegex'] if 'deliveryNumberRegex' in fp else ''
            self.orderNumberRegex = fp['orderNumberRegex'] if 'orderNumberRegex' in fp else ''
            self.vatRateList = fp['vatRateList'] if 'vatRateList' in fp else ''

    def get(self):
        array_locale = {
            'arrayDate': self.arrayDate,
            'dateRegex': self.dateRegex,
            'dueDateRegex': self.dueDateRegex,
            'VATNumberRegex': self.VATNumberRegex,
            'formatDate': self.formatDate,
            'dateTimeFormat': self.dateTimeFormat,
            'SIRETRegex': self.SIRETRegex,
            'SIRENRegex': self.SIRENRegex,
            'invoiceRegex': self.invoiceRegex,
            'invoiceSizeMin': self.invoiceSizeMin,
            'allRatesRegex': self.allRatesRegex,
            'noRatesRegex': self.noRatesRegex,
            'vatRateRegex': self.vatRateRegex,
            'deliveryNumberRegex': self.deliveryNumberRegex,
            'orderNumberRegex': self.orderNumberRegex,
            'vatRateList': self.vatRateList,
        }
        return array_locale
