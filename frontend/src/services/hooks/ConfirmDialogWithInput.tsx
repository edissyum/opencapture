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
import DOMPurify from "dompurify";
import React, { useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";

import Input from "../../components/Input";
import { Dropdown } from "../../components/Dropdown";

export function showConfirmDialogWithInput({
    icon,
    title,
    message,
    value = "",
    label = "",
    options = [],
    type = "string",
    placeholder = "",
    confirmText = t("GLOBAL.yes"),
    cancelText = t("GLOBAL.cancel"),
    onConfirm,
    onCancel
}: {
    title: string;
    type?: string;
    value?: string;
    label?: string;
    message: string;
    cancelText?: string;
    placeholder?: string;
    confirmText?: string;
    icon?: React.ReactNode;
    options?: { label: string; value: string }[];
    onCancel?: () => void;
    onConfirm: (value: string) => void;
}) {
    let inputValue = value;
    const InputWrapper = () => {
        const [val, setVal] = useState(value);
        inputValue = val;

        return (
            <div className="flex flex-col gap-3">
                <div className={ `flex gap-4 text-(--text-secondary)` }>
                    { icon && <div className="flex justify-center">{ icon }</div> }
                    <span dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(message) } }/>
                </div>
                { (type === "string" || type === "int") && (
                    <Input
                        autoFocus
                        value={ val }
                        label={ label }
                        className="w-full"
                        noMarginBottom={ true }
                        placeholder={ placeholder }
                        onChange={ (e) => setVal(e.target.value) }
                    />
                ) }
                { type === 'bool' && (
                    <Dropdown
                        id={ 'confirm-dialog-boolean' }
                        value={ val }
                        options={ [
                            { label: t('GLOBAL.true'), value: 'true' },
                            { label: t('GLOBAL.false'), value: 'false' },
                        ] }
                        onChange={ (e) => setVal(e.value) }
                    />
                ) }

                { type === 'list' && options && (
                    <Dropdown
                        id={ 'confirm-dialog-boolean' }
                        value={ val }
                        options={ options }
                        onChange={ (e) => setVal(e.value) }
                    />
                ) }
            </div>
        );
    };

    confirmDialog({
        header: title,
        draggable: false,
        closeOnEscape: true,
        dismissableMask: true,
        rejectLabel: cancelText,
        acceptLabel: confirmText,
        message: <InputWrapper/>,
        acceptClassName:
            "outline-none! shadow-none! bg-(--color-primary)! border-2! border-(--border-primary)! text-white! hover:bg-(--bg-selected)! hover:text-(--color-primary)! disabled:opacity-40!",
        rejectClassName:
            "outline-none! shadow-none! bg-transparent! text-(--text-secondary)! border-2! border-transparent! hover:border-2! hover:border-(--text-secondary)!",
        accept: () => {
            onConfirm(inputValue);
        },
        reject: () => {
            if (onCancel) onCancel();
        },
        defaultFocus: "reject"
    });
}
