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

import { BACKEND_URL } from "../config.tsx";
import { useCustom } from "../custom/customContext.tsx";
import { showToast } from "../../components/ToastProvider.tsx";
import { t } from "i18next";

export function axiosApiCall() {
    const custom = useCustom();
    const api = axios.create({
        headers: {
            "Content-Type": "application/json",
        },
        baseURL: `${BACKEND_URL}/` + (custom ? `${custom}/ws/` : "ws/"),
        timeout: 5000,
    });

    // Add a request interceptor to include the token in headers
    api.interceptors.request.use(config => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Add a response interceptor to handle 401 errors and refresh the token
    api.interceptors.response.use(
        res => res,
        async err => {
            const originalRequest = err.config;
            if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
                originalRequest._retry = true;

                const refreshToken = sessionStorage.getItem("refreshToken");
                if (!refreshToken) {
                    showToast(t('AUTH.session_expired'), "error");
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("refreshToken");
                    return Promise.reject(err);
                }

                try {
                    const refreshRes = await axios.post(
                        `${BACKEND_URL}/` + (custom ? `${custom}/ws/` : "ws/") + 'auth/login/refresh',
                        {'token': refreshToken},
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${refreshToken}`
                            }
                        }
                    );
                    const newAccessToken = refreshRes.data.token;
                    if (newAccessToken) {
                        sessionStorage.setItem("accessToken", newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        sessionStorage.setItem("user", JSON.stringify(refreshRes.data.user));
                        return api.request(originalRequest);
                    }
                } catch (refreshErr) {
                    showToast(t('AUTH.session_expired'), "error");
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("refreshToken");
                    return Promise.reject(refreshErr);
                }
            }
            return Promise.reject(err);
        }
    );

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
            if (err.response && err.response.data && err.response.data.message) {
                showToast(
                    <div>
                        <h4>
                            <strong>
                                {err.response.data.errors}
                            </strong>
                        </h4>
                        <p>
                            {err.response.data.message}
                        </p>
                    </div>, "error"
                )
            } else {
                showToast(err.message || "Erreur inconnue", "error");
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({...config, method: "GET", url});

    const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({...config, method: "POST", url, data});

    const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({...config, method: "PUT", url, data});

    const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({...config, method: "DELETE", url});

    return {loading, error, get, post, put, del};
}
