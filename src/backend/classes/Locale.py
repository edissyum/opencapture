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
    def __init__(self, configurations, docservers):
        self.locale = configurations['locale']
        self.date_path = docservers['LOCALE_PATH']
        self.array_date = []
        self.date_regex = ''
        self.due_date_regex = ''
        self.format_date = ''
        self.siret_regex = ''
        self.siren_regex = ''
        self.iban_regex = ''
        self.vat_number_regex = ''
        self.date_time_format = ''
        self.invoice_regex = ''
        self.invoice_size_min = ''
        self.all_rates_regex = ''
        self.no_rates_regex = ''
        self.vat_rate_regex = ''
        self.delivery_number_regex = ''
        self.order_number_regex = ''
        self.vat_rate_list = ''
        self.vat_amount_regex = ''

        with open(self.date_path + self.locale + '.json', encoding='UTF-8') as file:
            _fp = json.load(file)
            self.array_date = _fp['dateConvert'] if 'dateConvert' in _fp else ''
            self.date_regex = _fp['dateRegex'] if 'dateRegex' in _fp else ''
            self.due_date_regex = _fp['dueDateRegex'] if 'dueDateRegex' in _fp else ''
            self.vat_number_regex = _fp['VATNumberRegex'] if 'VATNumberRegex' in _fp else ''
            self.format_date = _fp['formatDate'] if 'formatDate' in _fp else ''
            self.date_time_format = _fp['dateTimeFormat'] if 'dateTimeFormat' in _fp else ''
            self.siret_regex = _fp['SIRETRegex'] if 'SIRETRegex' in _fp else ''
            self.siren_regex = _fp['SIRENRegex'] if 'SIRENRegex' in _fp else ''
            self.iban_regex = _fp['IBANRegex'] if 'IBANRegex' in _fp else ''
            self.invoice_regex = _fp['invoiceRegex'] if 'invoiceRegex' in _fp else ''
            self.invoice_size_min = _fp['invoiceSizeMin'] if 'invoiceSizeMin' in _fp else ''
            self.all_rates_regex = _fp['allRatesRegex'] if 'allRatesRegex' in _fp else ''
            self.no_rates_regex = _fp['noRatesRegex'] if 'noRatesRegex' in _fp else ''
            self.vat_rate_regex = _fp['vatRateRegex'] if 'vatRateRegex' in _fp else ''
            self.delivery_number_regex = _fp['deliveryNumberRegex'] if 'deliveryNumberRegex' in _fp else ''
            self.order_number_regex = _fp['orderNumberRegex'] if 'orderNumberRegex' in _fp else ''
            self.vat_rate_list = _fp['vatRateList'] if 'vatRateList' in _fp else ''
            self.vat_amount_regex = _fp['vatAmountRegex'] if 'vatAmountRegex' in _fp else ''

    def get(self):
        array_locale = {
            'arrayDate': self.array_date,
            'dateRegex': self.date_regex,
            'dueDateRegex': self.due_date_regex,
            'VATNumberRegex': self.vat_number_regex,
            'formatDate': self.format_date,
            'dateTimeFormat': self.date_time_format,
            'SIRETRegex': self.siret_regex,
            'SIRENRegex': self.siren_regex,
            'IBANRegex': self.iban_regex,
            'invoiceRegex': self.invoice_regex,
            'invoiceSizeMin': self.invoice_size_min,
            'allRatesRegex': self.all_rates_regex,
            'noRatesRegex': self.no_rates_regex,
            'vatRateRegex': self.vat_rate_regex,
            'deliveryNumberRegex': self.delivery_number_regex,
            'orderNumberRegex': self.order_number_regex,
            'vatRateList': self.vat_rate_list,
            'vatAmountRegex': self.vat_amount_regex,
        }
        return array_locale
