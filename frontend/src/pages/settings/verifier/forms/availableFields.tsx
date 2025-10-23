import type { TFunction } from "i18next";

export const getAvailableFields = (t: TFunction) => ({
    account: [
        { id: 'name', label: t('ACCOUNTS.supplier_name'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'firstname', label: t('ACCOUNTS.firstname'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'lastname', label: t('ACCOUNTS.lastname'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'function', label: t('ACCOUNTS.function'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'civility', label: t('ACCOUNTS.civility'), type: 'select', required: false, format: 'number', default_value: '' },
        { id: 'siret', label: t('ACCOUNTS.siret'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'siren', label: t('ACCOUNTS.siren'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'vat_number', label: t('ACCOUNTS.vat_number'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'iban', label: t('ACCOUNTS.iban'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'duns', label: t('ACCOUNTS.duns'), type: 'text', required: true, format: 'number_int', default_value: '' },
        { id: 'bic', label: t('ACCOUNTS.bic'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'rccm', label: t('ACCOUNTS.rccm'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'email', label: t('ACCOUNTS.email'), type: 'text', required: true, format: 'email', default_value: '' },
        { id: 'phone', label: t('ACCOUNTS.phone'), type: 'text', required: true, format: 'phone', default_value: '' },
        { id: 'address1', label: t('ACCOUNTS.address1'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'address2', label: t('ACCOUNTS.address2'), type: 'false', required: true, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'postal_code', label: t('ACCOUNTS.postal_code'), type: 'text', required: true, format: 'alphanum', default_value: '' },
        { id: 'country', label: t('ACCOUNTS.country'), type: 'text', required: true, format: 'alphanum_extended_with_accent', default_value: '' }
    ],
    lines: [
        { id: 'description', label: t('VERIFIER.item_description'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'reference', label: t('VERIFIER.item_reference'), type: 'text', required: false, format: 'alphanum_extended_with_accent', default_value: '' },
        { id: 'quantity', label: t('VERIFIER.item_quantity'), type: 'text', required: false, format: 'number', default_value: '' },
        { id: 'unit_price', label: t('VERIFIER.item_unit_price'), type: 'text', required: false, format: 'number_float', default_value: '' },
        { id: 'line_ht', label: t('VERIFIER.item_total_excl_tax'), type: 'text', required: false, format: 'number_float', default_value: '' },
        { id: 'line_vat_rat', label: t('VERIFIER.item_tax_rate'), type: 'text', required: false, format: 'number_float', default_value: '' }
    ],
    billing: [
        { id: 'invoice_number', label: t('VERIFIER.invoice_number'), type: 'text', required: true, format: 'alphanum_extended', default_value: '' },
        { id: 'invoice_date', label: t('VERIFIER.invoice_date'), type: 'date', required: true, format: 'date', default_value: '' },
        { id: 'due_date', label: t('VERIFIER.due_date'), type: 'date', required: false, format: 'date', default_value: '' }
    ],
    customFields: [],
});