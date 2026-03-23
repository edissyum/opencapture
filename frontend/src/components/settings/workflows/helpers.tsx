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

export const rotation_options = [
    { id: "no_rotation", label: t("WORKFLOWS.rotation_none") },
    { id: "90", label: t("WORKFLOWS.rotation_90") },
    { id: "180", label: t("WORKFLOWS.rotation_180") },
    { id: "270", label: t("WORKFLOWS.rotation_270") }
];

export const tesseract_function = [
    { id: 'line_box_builder', label: t('WORKFLOW.line_box_builder') },
    { id: 'text_builder', label: t('WORKFLOW.text_builder') }
];

export const convert_function = [
    { 'id': 'pdf2image', 'label': 'pdf2image' },
    { 'id': 'imagemagick', 'label': 'ImageMagick' }
];

export const system_fields = [
    { id: 'name', label: t('FORMS.supplier') },
    { id: 'contact', label: t('ACCOUNTS.informal_contact') },
    { id: 'subject', label: t('WORKFLOW.subject') },
    { id: 'invoice_number', label: t('FACTURATION.invoice_number') },
    { id: 'order_number', label: t('FACTURATION.order_number') },
    { id: 'quotation_number', label: t('FACTURATION.quotation_number') },
    { id: 'delivery_number', label: t('FACTURATION.delivery_number') },
    { id: 'document_date', label: t('FACTURATION.document_date') },
    { id: 'document_due_date', label: t('FACTURATION.document_due_date') },
    { id: 'firstname_lastname', label: t('FACTURATION.firstname_lastname') },
    { id: 'currency', label: t('WORKFLOW.currency') },
    { id: 'footer', label: t('WORKFLOW.footer') }
];