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
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";

import { mantineTheme } from "../mantineTheme";

function ConfirmDialogWithInputView({
    icon,
    title,
    message,
    value,
    label,
    options,
    type,
    placeholder,
    confirmText,
    cancelText,
    accept,
    reject
}: {
    icon?: React.ReactNode;
    title: string;
    message: string;
    value: string;
    label: string;
    options: { label: string; value: string }[];
    type: string;
    placeholder: string;
    confirmText: string;
    cancelText: string;
    accept: (value: string) => void;
    reject: () => void;
}) {
    const [val, setVal] = useState(value);

    return (
        <div
            className="fixed inset-0 z-99 flex items-center justify-center bg-black/50"
            onMouseDown={ (e) => {
                if (e.target === e.currentTarget) reject();
            } }
        >
            <div className="bg-(--bg-primary) rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
                <h2 className="text-lg font-semibold mb-4">{ title }</h2>
                <div className="flex flex-col gap-3 mb-6">
                    <div className='flex gap-4 text-(--text-secondary)'>
                        { icon && <div className="flex justify-center">{ icon }</div> }
                        <span dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(message) } }/>
                    </div>
                    { (type === "string" || type === "int") && (
                        <Input
                            autoFocus
                            value={ val }
                            label={ label }
                            className="w-full"
                            placeholder={ placeholder }
                            onChange={ (e) => setVal(e.target.value) }
                        />
                    ) }
                    { type === 'bool' && (
                        <Select
                            id='confirm-dialog-boolean'
                            value={ val.toString() }
                            withinPortal={ false }
                            options={ [
                                { label: t('GLOBAL.true'), value: 'true' },
                                { label: t('GLOBAL.false'), value: 'false' }
                            ] }
                            onChange={ (value: any) => setVal(value) }
                        />
                    ) }
                    { type === 'list' && options && (
                        <Select
                            id='confirm-dialog-boolean'
                            value={ val }
                            withinPortal={ false }
                            options={ options }
                            onChange={ (value: any) => setVal(value) }
                        />
                    ) }
                </div>
                <div className="flex justify-end">
                    <Button variant="no_bg" onClick={ reject }>
                        { cancelText }
                    </Button>
                    <Button className='outline-none! shadow-none! bg-(--color-primary)! ml-4! border!
                                       border-(--border-primary)! text-white! hover:bg-(--bg-selected)!
                                       hover:text-(--color-primary)! disabled:opacity-40!'
                            onClick={ () => accept(val) }>
                        { confirmText }
                    </Button>
                </div>
            </div>
        </div>
    );
}

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
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
        setTimeout(() => {
            root.unmount();
            container.remove();
        }, 0);
    };

    root.render(
        <MantineProvider theme={ mantineTheme }>
            <ConfirmDialogWithInputView
                icon={ icon }
                title={ title }
                message={ message }
                value={ value }
                label={ label }
                options={ options }
                type={ type }
                placeholder={ placeholder }
                confirmText={ confirmText }
                cancelText={ cancelText }
                accept={ (val) => {
                    onConfirm(val);
                    cleanup();
                } }
                reject={ () => {
                    if (onCancel) onCancel();
                    cleanup();
                } }
            />
        </MantineProvider>
    );
}