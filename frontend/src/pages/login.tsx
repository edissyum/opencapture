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
import { useNavigate } from "react-router-dom";
import { getI18n, useTranslation } from "react-i18next";

import { Button } from '../components/Button';
import { Input } from "../components/Input.tsx";
import { showToast } from "../components/ToastProvider.tsx";

import { useCustom } from "../services/custom/customContext.tsx";
import { axiosApiCall } from "../services/hooks/axiosApiCall.tsx";
import { useFormValues } from "../services/hooks/useFormValues.tsx";

export function Login() {
    const [loadingLogin, setLoadingLogin] = useState(false);

    const { t } = useTranslation();
    const { post } = axiosApiCall();
    const navigate = useNavigate();

    const custom = useCustom();

    const { handleSubmit, errors, handleChange } = useFormValues(async (values) => {
        try {
            setLoadingLogin(true);
            const data = {
                lang: getI18n().language,
                username: values.username.value,
                password: values.password.value
            };

            const response = await post("/auth/login", data);
            if (response) {
                showToast(t('AUTH.authenticated'));

                if (response.admin_password_alert) {
                    showToast(t('ERROR.admin_password_alert'), "warning");
                }

                sessionStorage.setItem("accessToken", response.auth_token);
                sessionStorage.setItem("refreshToken", response.refresh_token);
                sessionStorage.setItem("user", JSON.stringify(response.user));

                const onboardingCompleted = localStorage.getItem('onboardingCompleted');
                if (!onboardingCompleted) {
                    navigate('/onboarding', { replace: true });
                    setLoadingLogin(false);
                    return;
                }
                navigate('/home', { replace: true });
            }
            setLoadingLogin(false);
        } catch (err) {
            setLoadingLogin(false);
            return null;
        }
    }, t);

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src={"/src/assets/imgs/login_image.svg"} alt="Open-Capture" className="mx-auto" />
                <h2 className="mt-10 text-center text-2xl/9 tracking-tight text-(--text-primary)">
                    { t("GLOBAL.login") }
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="mt-2">
                        <Input id="username" type="text" name="username" required error={errors.username} onChange={handleChange} label={ t('USER.username') }/>
                    </div>
                    <div>
                        <Input id="password" type="password" name="password" required error={errors.password} onChange={handleChange} label={ t('USER.password') }/>
                    </div>

                    <div className="text-center">
                        <Button disabled={!custom} loading={loadingLogin} type="submit" size='md' className="w-full">
                            { t('AUTH.login') }
                        </Button>
                        {!custom && <p className="mt-2 text-sm text-(--text-secondary)">{ t('ERROR.custom_not_provided') }</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
