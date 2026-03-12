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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { BACKEND_URL } from "../config";
import { useCustom } from "../custom/customContext";
import { isRefreshing, setIsRefreshing } from "./authRefreshState";

import { showToast } from "../../components/ToastProvider";

interface AxiosCustomRequestConfig extends AxiosRequestConfig {
    showErrorToast?: boolean;
    onUploadProgress?: (progress: any) => void;
}

/* ------------------------------------------------------------------ */
/*  Singleton Axios instance — created once per `custom` value        */
/* ------------------------------------------------------------------ */

const instanceCache = new Map<string, AxiosInstance>();

// Mutable ref so the interceptor can call navigate() without being
// recreated on every render.  Updated by the hook below.
let _navigate: ((path: string) => void) | null = null;

function getOrCreateApi(custom: string | null): AxiosInstance {
    const key = custom ?? "__default__";

    const cached = instanceCache.get(key);
    if (cached) return cached;

    const api = axios.create({
        headers: {
            "Content-Type": "application/json",
        },
        baseURL: `${ BACKEND_URL }/` + (custom ? `${ custom }/ws/` : "ws/")
    });

    // Add a request interceptor to include the token in headers
    api.interceptors.request.use(config => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${ token }`;
        }
        return config;
    });

    // Add a response interceptor to handle 401 errors and refresh the token
    api.interceptors.response.use(
        res => res,
        async err => {
            const originalRequest = err.config;
            if (err.response?.status === 401 && !originalRequest._retry && !isRefreshing && !originalRequest.url.includes('/auth/login')) {
                originalRequest._retry = true;
                setIsRefreshing(true);

                const refreshToken = sessionStorage.getItem("refreshToken");
                if (!refreshToken) {
                    showToast(t('AUTH.session_expired'), "error");
                    sessionStorage.clear();
                    return Promise.reject(err);
                }

                try {
                    const refreshRes = await axios.post(
                        `${ BACKEND_URL }/` + (custom ? `${ custom }/ws/` : "ws/") + 'auth/login/refresh',
                        { 'token': refreshToken },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${ refreshToken }`
                            }
                        }
                    );
                    const newAccessToken = refreshRes.data.token;
                    if (newAccessToken) {
                        setIsRefreshing(false);
                        sessionStorage.setItem("accessToken", newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${ newAccessToken }`;
                        sessionStorage.setItem("user", JSON.stringify(refreshRes.data.user));
                        return api.request(originalRequest);
                    }
                } catch (refreshErr) {
                    setIsRefreshing(false);
                    showToast(t('AUTH.session_expired'), "error");
                    sessionStorage.clear();
                    _navigate?.('/login');
                    return Promise.reject(refreshErr);
                }
            }
            return Promise.reject(err);
        }
    );

    instanceCache.set(key, api);
    return api;
}

/* ------------------------------------------------------------------ */
/*  Hook — lightweight wrapper, only manages per-component state      */
/* ------------------------------------------------------------------ */

export function axiosApiCall() {
    const custom = useCustom();
    // Keep the module-level navigate ref in sync so the interceptor
    // always has access to the latest router navigate function.
    _navigate = useNavigate();

    // Get the cached singleton (Map.get — O(1), no object allocation)
    const api = getOrCreateApi(custom);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const request = async <T = any>(
        config: AxiosCustomRequestConfig
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const res = await api.request<T>({
                ...config,
                onUploadProgress: (event) => {
                    if (event.total) {
                        const progress = Math.round(
                            (event.loaded * 100) / event.total
                        );
                        setUploadProgress(progress);
                        config.onUploadProgress?.(progress);
                    }
                },
            });
            return res.data;
        } catch (err: any) {
            if (err.response?.status === 401 && err.config?.url && !err.config.url.includes('/auth/login')) {
                // Handled by interceptor if we're not already on the login endpoint
                return null;
            }

            setError(err.message || t('ERROR.unknown_error'));
            if (config.showErrorToast !== false) {
                if (err.response && err.response.data && err.response.data.message || err.response?.status === 429) {
                    const title = err.response?.status === 429 ? t('ERROR.too_many_requests') : err.response.data.errors;
                    const details = err.response?.status === 429 ? t('ERROR.too_many_requests_details') : err.response.data.message;

                    showToast(
                        <div>
                            <h4>
                                <strong>
                                    { title }
                                </strong>
                            </h4>
                            <p>
                                { details }
                            </p>
                        </div>, "error"
                    )
                } else {
                    if (err.response?.status === 429) {
                        showToast(t('ERROR.too_many_requests'), "error");
                    } else {
                        showToast(err.message || t('ERROR.unknown_error'), "error");
                    }
                }
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const get = <T = any>(url: string, config?: AxiosCustomRequestConfig) =>
        request<T>({ ...config, method: "GET", url });

    const post = <T = any>(url: string, data?: any, config?: AxiosCustomRequestConfig) =>
        request<T>({ ...config, method: "POST", url, data });

    const put = <T = any>(url: string, data?: any, config?: AxiosCustomRequestConfig) =>
        request<T>({ ...config, method: "PUT", url, data });

    const del = <T = any>(url: string, config?: AxiosCustomRequestConfig) =>
        request<T>({ ...config, method: "DELETE", url });

    return { loading, error, uploadProgress, get, post, put, del };
}
