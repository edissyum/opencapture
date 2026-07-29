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

import type { TFunction } from "i18next";

export const getAvailableFields = (t: TFunction) => ({
    supplier: [
        { id: 'name', color: '#426CF5', label: t('ACCOUNTS.supplier_name'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'firstname', color: '#426CF5', label: t('ACCOUNTS.firstname'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'lastname', color: '#426CF5', label: t('ACCOUNTS.lastname'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'function', label: t('ACCOUNTS.function'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'civility', label: t('ACCOUNTS.civility'), type: 'select', required: false, format: 'number', default_value: '' },
        { id: 'siret', color: '#64C800', label: t('ACCOUNTS.siret'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'siren', color: '#19864B', label: t('ACCOUNTS.siren'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'vat_number', color: '#F469F6', label: t('ACCOUNTS.vat_number'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'iban', color: '#974600', label: t('ACCOUNTS.iban'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'duns', color: '#19864B', label: t('ACCOUNTS.duns'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'bic', color: '#19864B', label: t('ACCOUNTS.bic'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'rccm', color: '#19864B', label: t('ACCOUNTS.rccm'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'email', color: '#19864B', label: t('ACCOUNTS.email'), type: 'text', required: true, format: 'email', default_value: '' },
        { id: 'phone', label: t('ACCOUNTS.phone'), type: 'text', required: false, format: 'phone', default_value: '' },
        { id: 'address1', label: t('ACCOUNTS.address1'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'address2', label: t('ACCOUNTS.address2'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'postal_code', label: t('ACCOUNTS.postal_code'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'city', label: t('ACCOUNTS.city'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'country', label: t('ACCOUNTS.country'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' }
    ],
    lines: [
        { id: 'poste', label: t('VERIFIER.poste'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'description', label: t('VERIFIER.item_description'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'reference', label: t('VERIFIER.item_reference'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'quantity', label: t('VERIFIER.item_quantity'), type: 'text', required: false, format: 'number', default_value: '' },
        { id: 'unity', label: t('VERIFIER.unity'), type: 'text', required: false, format: 'number', default_value: '' },
        { id: 'unit_price', label: t('VERIFIER.item_unit_price'), type: 'text', required: false, format: 'number_float', default_value: '' },
        { id: 'line_ht', label: t('VERIFIER.item_total_excl_tax'), type: 'text', required: false, format: 'number_float', default_value: '' },
        { id: 'line_vat_rat', label: t('VERIFIER.item_tax_rate'), type: 'text', required: false, format: 'number_float', default_value: '' }
    ],
    billing: [
        { id: 'invoice_number', color: '#CD0D0D', label: t('VERIFIER.invoice_number'), type: 'text', required: true, format: 'alphanum_extended', default_value: '' },
        { id: 'delivery_number', color: '#6E6E6E', label: t('VERIFIER.delivery_number'), type: 'text', required: false, format: 'alphanum_extended', default_value: '' },
        { id: 'quotation_number', color: '#E66910', label: t('VERIFIER.quotation_number'), type: 'text', required: false, format: 'alphanum_extended', default_value: '' },
        { id: 'order_number', color: '#E66910', label: t('VERIFIER.order_number'), type: 'text', required: false, format: 'alphanum_extended', default_value: '' },
        { id: 'document_date', color: '#B3A613', label: t('VERIFIER.document_date'), type: 'date', required: true, format: 'date', default_value: '' },
        { id: 'subject', color: '#CD0D0D', label: t('VERIFIER.subject'), type: 'text', required: false, format: 'alphanum_extended', default_value: '' },
        { id: 'document_due_date', color: '#1CC7BE', label: t('VERIFIER.document_due_date'), type: 'date', required: true, format: 'date', default_value: '' },
        { id: 'no_rate_amount', color: '#E600E6', label: t('VERIFIER.no_rate_amount'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'vat_amount', color: '#57076B', label: t('VERIFIER.vat_amount'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'total_ht', color: '#19864B', label: t('VERIFIER.total_ht'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'total_vat', color: '#19864B', label: t('VERIFIER.total_vat'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'total_ttc', color: '#19864B', label: t('VERIFIER.total_ttc'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'vat_rate', color: '#F469F6', label: t('VERIFIER.vat_rate'), type: 'text', required: true, format: 'number_float', default_value: '' },
        { id: 'currency', color: '#F469F6', label: t('VERIFIER.currency'), type: 'text', required: false, format: 'alphanum', default_value: '' },
        { id: 'accounting_plan', label: t('VERIFIER.accounting_plan'), type: 'select', required: false, format: 'number', default_value: '' }
    ],
    customFields: []
});