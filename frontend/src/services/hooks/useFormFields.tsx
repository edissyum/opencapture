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

import { useEffect, useState } from "react";

import { axiosApiCall } from "./axiosApiCall";

export interface FormField {
    flatMap(arg0: (line: any) => any[]): any;
    flat(): any;
    map(arg0: (line: any, index: number) => { id: string; fields: any; }): any;
    forEach(arg0: (line: any) => void): any;
    id: string;
    name: string;
    label: string;
    type: string;
    value?: any;
}

interface useFormFieldsResult {
    formFields: FormField[];
    loading: boolean;
    error?: string | null;
}

export function useFormFields(formId: number): useFormFieldsResult {
    const { get, loading, error } = axiosApiCall();
    const [formFields, setFormFields] = useState<useFormFieldsResult[]>([]);

    useEffect(() => {
        if (!formId) return;

        const fetchFormFields = async () => {
            try {
                const data = await get(`forms/fields/getByFormId/${ formId }`, {
                    showErrorToast: true,
                });
                if (data) setFormFields(data.fields);
            } catch {
            }
        };

        fetchFormFields().then();
    }, [formId]);

    // @ts-ignore
    return { formFields, loading, error };
}
