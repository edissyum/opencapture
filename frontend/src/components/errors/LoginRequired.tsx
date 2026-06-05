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

import { useEffect } from "react";
import { getI18n, useTranslation } from "react-i18next";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

import { showToast } from "../ToastProvider";

import { USER_KEY } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";

export default function LoginRequiredError() {
    const { t } = useTranslation();
    const { post } = axiosApiCall();
    const error = useRouteError();
    const navigate = useNavigate();

    useEffect(() => {
        if (isRouteErrorResponse(error) && error.status === 401) {
            const accessToken = sessionStorage.getItem("accessToken");
            const token = new URLSearchParams(window.location.search).get("token");

            if (!accessToken && token) {
                post("/auth/login", {
                    'token': token,
                    'lang': getI18n().language
                }).then((response) => {
                    sessionStorage.setItem("accessToken", response.auth_token);
                    sessionStorage.setItem("refreshToken", response.refresh_token);
                    sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));

                    const splitted = window.location.pathname.split('/').filter(Boolean);
                    const route = splitted[splitted.length - 1];
                    navigate('/' + route, { replace: true });
                    navigate(0);
                    return;
                })
                return;
            }

            if (!accessToken) {
                showToast(t('ERROR.login_required'), "error");
                navigate("/login");
            }
        }

    }, [error, navigate]);

    return null;
}
