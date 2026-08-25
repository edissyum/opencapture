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
import DOMPurify from "dompurify";
import { createRoot } from "react-dom/client";

import Hint from "../../components/Hint";
import { Button } from "../../components/Button";

function ConfirmDialogView({
    hint,
    title,
    danger,
    message,
    cancelText,
    confirmText,
    accept,
    reject
}: {
    hint?: string;
    title: string;
    message: string;
    danger?: boolean;
    cancelText: string;
    confirmText: string;
    accept: () => void;
    reject: () => void;
}) {
    let acceptClassName = "outline-none! shadow-none! border! text-white! ml-4! px-4 py-2 rounded";
    if (!danger) {
        acceptClassName += " bg-(--color-primary)! border-(--border-primary)! hover:bg-(--bg-selected)! hover:text-(--color-primary)!";
    } else {
        acceptClassName += " bg-(--text-error)! border-(--text-error)! hover:bg-(--text-error)/10! hover:text-(--text-error)!";
    }

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50"
            onMouseDown={ (e) => { if (e.target === e.currentTarget) reject(); } }
        >
            <div className="bg-(--bg-primary) rounded-lg shadow-xl max-w-3xl mx-4 p-6">
                <h2 className="text-lg font-semibold mb-4">{ title }</h2>
                <div className="flex flex-col gap-3 mb-6">
                    <span dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(message) } }/>
                    { hint && (
                        <Hint variant={ danger ? "error" : "success" }>
                            { hint }
                        </Hint>
                    ) }
                </div>
                <div className="flex justify-end">
                    <Button variant="no_bg" onClick={ reject }>
                        { cancelText }
                    </Button>
                    <Button className={ acceptClassName } onClick={ accept }>
                        { confirmText }
                    </Button>
                </div>
            </div>
        </div>
    );
}

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
        <ConfirmDialogView
            hint={ hint }
            title={ title }
            danger={ danger }
            message={ message }
            cancelText={ cancelText }
            confirmText={ confirmText }
            accept={ () => { onConfirm(); cleanup(); } }
            reject={ () => { if (onCancel) onCancel(); cleanup(); } }
        />
    );
}