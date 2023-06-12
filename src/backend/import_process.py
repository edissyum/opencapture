# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# pylint: skip-file

from .functions import get_custom_array

custom_array = get_custom_array()

if 'FindDate' or 'process' not in custom_array['find_date']['path']:
    from src.backend.process.find_date import FindDate
elif 'process' in custom_array['FindDate']['path']:
    find_date = getattr(__import__(custom_array['find_date']['path'] + '.' + custom_array['find_date']['module'],
                                   fromlist=[custom_array['find_date']['module']]), custom_array['find_date']['module'])

if 'find_due_date' or 'process' not in custom_array['find_due_date']['path']:
    from src.backend.process.find_due_date import FindDueDate
elif 'process' in custom_array['find_due_date']['path']:
    find_due_date = getattr(__import__(custom_array['find_due_date']['path'] + '.' +
                                       custom_array['find_due_date']['module'],
                                       fromlist=[custom_array['find_due_date']['module']]),
                            custom_array['find_due_date']['module'])

if 'find_footer' or 'process' not in custom_array['find_footer']['path']:
    from src.backend.process.find_footer import FindFooter
elif 'process' in custom_array['find_footer']['path']:
    find_footer = getattr(__import__(custom_array['find_footer']['path'] + '.' + custom_array['find_footer']['module'],
                                     fromlist=[custom_array['find_footer']['module']]),
                          custom_array['find_footer']['module'])

if 'find_supplier' or 'process' not in custom_array['find_supplier']['path']:
    from src.backend.process.find_supplier import FindSupplier
elif 'process' in custom_array['find_supplier']['path']:
    find_supplier = getattr(__import__(custom_array['find_supplier']['path'] + '.' +
                                       custom_array['find_supplier']['module'],
                                       fromlist=[custom_array['find_supplier']['module']]),
                            custom_array['FindSupplier']['module'])

if 'find_custom' or 'process' not in custom_array['find_custom']['path']:
    from src.backend.process.find_custom import FindCustom
elif 'process' in custom_array['FindCustom']['path']:
    find_custom = getattr(__import__(custom_array['find_custom']['path'] + '.' + custom_array['find_custom']['module'],
                                     fromlist=[custom_array['find_custom']['module']]),
                          custom_array['find_custom']['module'])

if 'find_invoice_number' or 'process' not in custom_array['find_invoice_number']['path']:
    from src.backend.process.find_invoice_number import FindInvoiceNumber
elif 'process' in custom_array['FindInvoiceNumber']['path']:
    find_invoice_number = getattr(__import__(custom_array['find_invoice_number']['path'] + '.' +
                                             custom_array['find_invoice_number']['module'],
                                             fromlist=[custom_array['find_invoice_number']['module']]),
                                  custom_array['find_invoice_number']['module'])

if 'find_quotation_number' or 'process' not in custom_array['find_quotation_number']['path']:
    from src.backend.process.find_quotation_number import FindQuotationNumber
elif 'process' in custom_array['FindQuotationNumber']['path']:
    find_quotation_number = getattr(__import__(custom_array['find_quotation_number']['path'] + '.' +
                                               custom_array['find_quotation_number']['module'],
                                               fromlist=[custom_array['find_quotation_number']['module']]),
                                    custom_array['find_quotation_number']['module'])

if 'find_delivery_number' or 'process' not in custom_array['find_delivery_number']['path']:
    from src.backend.process.find_delivery_number import FindDeliveryNumber
elif 'process' in custom_array['FindDeliveryNumber']['path']:
    find_delivery_number = getattr(__import__(custom_array['find_delivery_number']['path'] + '.' +
                                              custom_array['find_delivery_number']['module'],
                                              fromlist=[custom_array['find_delivery_number']['module']]),
                                   custom_array['find_delivery_number']['module'])

if 'find_footer_raw' or 'process' not in custom_array['find_footer_raw']['path']:
    from src.backend.process.find_footer_raw import FindFooterRaw
elif 'process' in custom_array['find_footer_raw']['path']:
    find_footer_raw = getattr(__import__(custom_array['find_footer_raw']['path'] + '.' +
                                         custom_array['find_footer_raw']['module'],
                                         fromlist=[custom_array['find_footer_raw']['module']]),
                              custom_array['find_footer_raw']['module'])
