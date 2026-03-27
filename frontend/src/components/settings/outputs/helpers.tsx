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

export const getCompressTypeOptions = () => [
    { id: "", label: t("OUTPUTS.no_compress") },
    { id: "screen", label: t("OUTPUTS.compress_screen") },
    { id: "ebook", label: t("OUTPUTS.compress_ebook") },
    { id: "prepress", label: t("OUTPUTS.compress_prepress") },
    { id: "printer", label: t("OUTPUTS.compress_printer") },
    { id: "default", label: t("OUTPUTS.compress_default") }
];

export const getSystemFieldsOptions = () => [
    { id: 'name', label: t('ACCOUNTS.supplier_name') },
    { id: 'b64_file_content', label: t('OUTPUTS.b64_file_content') },
    { id: 'original_filename', label: t('OUTPUTS.original_filename') },
    { id: 'firstname', label: t('ACCOUNTS.firstname') },
    { id: 'lastname', label: t('ACCOUNTS.lastname') },
    { id: 'function', label: t('ACCOUNTS.function') },
    { id: 'civility', label: t('ACCOUNTS.civility') },
    { id: 'siret', label: t('ACCOUNTS.siret') },
    { id: 'siren', label: t('ACCOUNTS.siren') },
    { id: 'vat_number', label: t('ACCOUNTS.vat_number') },
    { id: 'iban', label: t('ACCOUNTS.iban') },
    { id: 'duns', label: t('ACCOUNTS.duns') },
    { id: 'bic', label: t('ACCOUNTS.bic') },
    { id: 'rccm', label: t('ACCOUNTS.rccm') },
    { id: 'email', label: t('ACCOUNTS.email') },
    { id: 'phone', label: t('ACCOUNTS.phone') },
    { id: 'invoice_number', label: t('VERIFIER.invoice_number') },
    { id: 'delivery_number', label: t('VERIFIER.delivery_number') },
    { id: 'quotation_number', label: t('VERIFIER.quotation_number') },
    { id: 'order_number', label: t('VERIFIER.order_number') },
    { id: 'current_date', label: t('OUTPUTS.current_date') },
    { id: 'document_date_full', label: t('OUTPUTS.document_date_full') },
    { id: 'document_date_year', label: t('OUTPUTS.document_date_year') },
    { id: 'document_date_month', label: t('OUTPUTS.document_date_month') },
    { id: 'document_date_day', label: t('OUTPUTS.document_date_day') },
    { id: 'register_date_full', label: t('OUTPUTS.register_date_full') },
    { id: 'register_date_year', label: t('OUTPUTS.register_date_year') },
    { id: 'register_date_month', label: t('OUTPUTS.register_date_month') },
    { id: 'register_date_day', label: t('OUTPUTS.register_date_day') },
    { id: 'total_ht', label: t('VERIFIER.total_ht') },
    { id: 'total_vat', label: t('VERIFIER.total_vat') },
    { id: 'total_ttc', label: t('VERIFIER.total_ttc') },
    { id: 'currency', label: t('VERIFIER.currency') }
];