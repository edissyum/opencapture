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

import { useEffect, useRef, useState } from "react";

import { axiosApiCall } from "./axiosApiCall";

export interface CustomField {
    id: string;
    name: string;
    label: string;
    type: string;
    value?: any;
}

interface UseCustomFieldsResult {
    customFields: CustomField[];
    loading: boolean;
    error?: string | null;
}

export function useCustomFields(module: string): UseCustomFieldsResult {
    const { get, loading, error } = axiosApiCall();
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const lastModuleRef = useRef<string | null>(null);

    useEffect(() => {
        if (!module || lastModuleRef.current === module) return;
        lastModuleRef.current = module;

        const fetchCustomFields = async () => {
            try {
                const data = await get(`customFields/list?module=${ module }`, {
                    showErrorToast: true,
                });
                if (data) setCustomFields(data.customFields);
            } catch (error) {
                console.error("Failed to fetch custom fields : ", error);
            }
        };

        fetchCustomFields().then();
    }, [module, get]);

    return { customFields, loading, error };
}
