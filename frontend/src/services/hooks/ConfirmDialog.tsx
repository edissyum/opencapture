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

import Hint from "../../components/Hint";

export function showConfirmDialog({
    hint,
    title,
    danger,
    message,
    cancelText = t('GLOBAL.cancel'),
    confirmText = t('GLOBAL.yes'),
    onConfirm,
    onCancel
}: {
    hint?: string;
    title: string;
    message: string;
    danger?: boolean;
    cancelText?: string;
    confirmText?: string;
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
}) {
    let acceptClassName = "outline-none! shadow-none! border-2! text-white!";

    if (!danger) {
        acceptClassName += " bg-(--color-primary)! border-(--border-primary)! hover:bg-(--color-primary)/10! hover:text-(--color-primary)!";
    } else {
        acceptClassName += " bg-(--text-error)! border-(--text-error)! hover:bg-(--text-error)/10! hover:text-(--text-error)!";
    }

    let content: any = <span dangerouslySetInnerHTML={ { __html: message } }/>;
    if (hint) {
        content = (
            <>
                <span dangerouslySetInnerHTML={ { __html: message } }/>

                { hint && (
                    <Hint variant={ danger ? "error" : "success" }>
                        { hint }
                    </Hint>
                ) }
            </>
        );
    }

    confirmDialog({
        header: title,
        draggable: false,
        closeOnEscape: true,
        dismissableMask: true,
        className: "max-w-3xl!",
        rejectLabel: cancelText,
        acceptLabel: confirmText,
        message: content,
        acceptClassName: acceptClassName,
        rejectClassName: "outline-none! shadow-none! bg-transparent! text-(--text-secondary)! border-2! border-transparent! hover:border-2! hover:border-(--text-secondary)!",
        accept() {
            onConfirm();
        },
        reject() {
            if (onCancel) onCancel();
        }
    })
}