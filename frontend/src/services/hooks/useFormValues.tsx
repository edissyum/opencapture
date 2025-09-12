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

import React, { useCallback, useState } from "react";
import type { TFunction } from "i18next";

export function useFormValues(
    onSubmit: (values: Record<string, { value: any; required: boolean }>) => void,
    t: TFunction
) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const form = e.currentTarget;
            const formData = new FormData(form);
            const values: Record<string, { value: any; required: boolean }> = {};
            const newErrors: Record<string, string> = {};

            for (const [name, value] of formData.entries()) {
                const input = form.elements.namedItem(name) as
                    | HTMLInputElement
                    | HTMLSelectElement
                    | HTMLTextAreaElement;

                const required = input?.required ?? false;

                values[name] = {
                    value,
                    required,
                };

                const isEmpty = input?.type === "checkbox" ? !(input as HTMLInputElement).checked : value === "";
                if (required && isEmpty) {
                    let labelText = name;
                    if (input.id) {
                        const label = form.querySelector(`label[for="${input.id}"]`);
                        if (label) {
                            labelText = label.textContent?.replace(/\*$/, "").trim() || name;
                        }
                    }

                    newErrors[name] = `<strong class="font-bold">${labelText}</strong> ${ t('AUTH.field_required') }`;
                }
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                onSubmit(values);
            }
        },
        [onSubmit]
    );

    // Gestion de la suppression automatique des erreurs à la saisie
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            if (errors[name]) {
                const isEmpty = type === "checkbox" ? !(e.target as HTMLInputElement).checked : value === "";
                if (!isEmpty) {
                    setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy[name];
                        return copy;
                    });
                }
            }
        },
        [errors]
    );

    return { handleSubmit, errors, handleChange };
}
