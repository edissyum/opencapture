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
import React, { useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";

import { Input } from "../../components/Input";

export function showConfirmDialogWithInput({
    title,
    message,
    icon,
    placeholder = "",
    cancelText = t("GLOBAL.cancel"),
    confirmText = t("GLOBAL.yes"),
    value = "",
    onConfirm,
    onCancel,
}: {
    title: string;
    message: string;
    icon?: React.ReactNode;
    placeholder?: string;
    cancelText?: string;
    confirmText?: string;
    value?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}) {

    let inputValue = value;

    const InputWrapper = () => {
        const [val, setVal] = useState(value);

        inputValue = val;

        return (
            <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                    {icon && <div className="flex justify-center">{icon}</div>}
                    <span dangerouslySetInnerHTML={{ __html: message }} />
                </div>
                <Input
                    autoFocus
                    no_margin_bottom={true}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder={placeholder}
                    className="w-full"
                />
            </div>
        );
    };

    confirmDialog({
        closeOnEscape: true,
        dismissableMask: true,
        message: <InputWrapper />,
        header: title,
        acceptLabel: confirmText,
        rejectLabel: cancelText,
        acceptClassName:
            "outline-none! shadow-none! bg-(--color-primary)! border-2! border-(--border-primary)! text-white! hover:bg-(--color-primary)/10! hover:text-(--color-primary)! disabled:opacity-40!",
        rejectClassName:
            "outline-none! shadow-none! bg-transparent! text-(--text-secondary)! border-2! border-transparent! hover:border-2! hover:border-(--text-secondary)!",
        accept: () => {
            onConfirm(inputValue);
        },
        reject: () => {
            onCancel();
        },
        defaultFocus: "reject",
    });
}
