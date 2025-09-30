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
import { useNavigate } from "react-router-dom";
import { getI18n, useTranslation } from "react-i18next";

import { Button } from '../components/Button';
import { Input } from "../components/Input";
import { showToast } from "../components/ToastProvider";

import { useCustom } from "../services/custom/customContext";
import { axiosApiCall } from "../services/hooks/axiosApiCall";
import { useFormValues } from "../services/hooks/useFormValues";
import { LoginImage } from "../components/LoginImage";

export function Login() {
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [loginMessage, setLoginMessage] = useState<string>('');

    const { t } = useTranslation();
    const { get, post } = axiosApiCall();
    const navigate = useNavigate();

    const custom = useCustom();

    useEffect(() => {
        async function getLoginMessage() {
            if (!loginMessage) {
                await get("/config/getConfigurationNoAuth/loginMessage").then((response) => {
                    if (response && response.configuration) {
                        setLoginMessage(response.configuration[0]?.data.value || t('AUTH.welcome'));
                    } else {
                        setLoginMessage(t('AUTH.welcome'));
                    }
                });
            }
        }
        getLoginMessage().then();
    }, [loginMessage]);

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
                <LoginImage className="mx-auto"></LoginImage>
                <h2 className="mt-10 text-center text-2xl/9 tracking-tight text-(--text-primary)">
                    { t("GLOBAL.login") }
                </h2>
                <p className="mt-2 text-center text-sm text-(--text-secondary)" dangerouslySetInnerHTML={{ __html: loginMessage }}/>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={ handleSubmit } className="space-y-6" noValidate>
                    <div className="mt-2">
                        <Input id="username" type="text" name="username" required error={ errors.username }
                               onChange={ handleChange } label={ t('USER.username') }/>
                    </div>
                    <div>
                        <Input id="password" type="password" name="password" required error={ errors.password }
                               onChange={ handleChange } label={ t('USER.password') }/>
                    </div>

                    <div className="text-center">
                        <Button disabled={ !custom } loading={ loadingLogin } type="submit" size='md'
                                className="w-full">
                            { t('AUTH.login') }
                        </Button>
                        { !custom &&
                            <p className="mt-2 text-sm text-(--text-secondary)">{ t('ERROR.custom_not_provided') }</p> }
                    </div>
                </form>
            </div>
        </div>
    );
}
