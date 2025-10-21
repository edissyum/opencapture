/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import { t } from "i18next";

export const availableFields = {
    account: [
        { id: 'name', label: t('ACCOUNTS.supplier_name'), type: 'text', required: true, format: '' },
        { id: 'firstname', label: t('ACCOUNTS.firstname'), type: 'text', required: true, format: '' },
        { id: 'lastname', label: t('ACCOUNTS.lastname'), type: 'text', required: true, format: '' },
        { id: 'function', label: t('ACCOUNTS.function'), type: 'text', required: true, format: '' },
        { id: 'civility', label: t('ACCOUNTS.civility'), type: 'select', required: true, format: '' },
        { id: 'siret', label: t('ACCOUNTS.siret'), type: 'text', required: true, format: '' },
        { id: 'siren', label: t('ACCOUNTS.siren'), type: 'text', required: true, format: '' },
        { id: 'vat_number', label: t('ACCOUNTS.vat_number'), type: 'text', required: true, format: '' },
        { id: 'iban', label: t('ACCOUNTS.iban'), type: 'text', required: true, format: '' },
        { id: 'duns', label: t('ACCOUNTS.duns'), type: 'text', required: true, format: '' },
        { id: 'bic', label: t('ACCOUNTS.bic'), type: 'text', required: true, format: '' },
        { id: 'rccm', label: t('ACCOUNTS.rccm'), type: 'text', required: true, format: '' },
        { id: 'email', label: t('ACCOUNTS.email'), type: 'text', required: true, format: '' },
        { id: 'phone', label: t('ACCOUNTS.phone'), type: 'text', required: true, format: '' },
        { id: 'address1', label: t('ACCOUNTS.address1'), type: 'text', required: true, format: '' },
        { id: 'address2', label: t('ACCOUNTS.address2'), type: 'text', required: true, format: '' },
        { id: 'postal_code', label: t('ACCOUNTS.postal_code'), type: 'text', required: true, format: '' },
        { id: 'country', label: t('ACCOUNTS.country'), type: 'text', required: true, format: '' }
    ],
    lines: [
        { id: 'description', label: t('VERIFIER.item_description') },
        { id: 'reference', label: t('VERIFIER.item_reference') },
        { id: 'quantity', label: t('VERIFIER.item_quantity') },
        { id: 'unit_price', label: t('VERIFIER.item_unit_price') },
        { id: 'line_ht', label: t('VERIFIER.item_total_excl_tax') },
        { id: 'line_vat_rat', label: t('VERIFIER.item_tax_rate') }
    ],
    billing: [
        { label: 'Invoice Number', value: 'invoice_number' },
        { label: 'Invoice Date', value: 'invoice_date' },
        { label: 'Due Date', value: 'due_date' },
        { label: 'Total Amount', value: 'total_amount' },
        { label: 'Tax Amount', value: 'tax_amount' },
        { label: 'Currency', value: 'currency' },
    ],
    customFields: [],
};
