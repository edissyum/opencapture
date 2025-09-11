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

import { useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";
import { useCustom } from "../custom/customContext.tsx";
import { BACKEND_URL } from "../config.tsx";

const custom = useCustom();
const api = axios.create({
    baseURL: `${BACKEND_URL}/` + (custom ? `${custom}/ws/` : "ws/"),
    timeout: 5000,
});

export function axiosApiCall() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = async <T = any>(
        config: AxiosRequestConfig
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.request<T>(config);
            return res.data;
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "GET", url });

    const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "POST", url, data });

    const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "PUT", url, data });

    const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "DELETE", url });

    return { loading, error, get, post, put, del };
}
