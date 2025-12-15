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

import React from "react";
import { t } from "i18next";
import { confirmDialog } from 'primereact/confirmdialog';

export function showConfirmDialog({
    title,
    message,
    icon,
    cancelText = t('GLOBAL.cancel'),
    confirmText = t('GLOBAL.yes'),
    onConfirm,
    onCancel
}: {
    title: string;
    message: string;
    icon?: React.ReactNode;
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    confirmDialog({
        icon: icon,
        header: title,
        draggable: false,
        closeOnEscape: true,
        dismissableMask: true,
        rejectLabel: cancelText,
        acceptLabel: confirmText,
        message: <span dangerouslySetInnerHTML={ { __html: message } }/>,
        acceptClassName: "outline-none! shadow-none! bg-(--color-primary)! border-2! border-(--border-primary)! text-white! hover:bg-(--color-primary)/10! hover:text-(--color-primary)!",
        rejectClassName: "outline-none! shadow-none! bg-transparent! text-(--text-secondary)! border-2! border-transparent! hover:border-2! hover:border-(--text-secondary)!",
        accept() {
            onConfirm();
        },
        reject() {
            onCancel();
        }
    })
}