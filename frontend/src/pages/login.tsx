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

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getI18n, useTranslation } from "react-i18next";

import packageJson from "../../package.json";

import Input from "../components/Input";
import { Button } from '../components/Button';
import { LoginImage } from "../components/LoginImage";
import { showToast } from "../components/ToastProvider";

import { useCustom } from "../services/custom/customContext";
import { axiosApiCall } from "../services/hooks/axiosApiCall";
import { useFormValues } from "../services/hooks/useFormValues";

export function Login() {
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [loginMessage, setLoginMessage] = useState<string>('');
    const [enabledLoginMethod, setEnabledLoginMethod] = useState<string>('');

    const { t } = useTranslation();
    const { get, post } = axiosApiCall();
    const navigate = useNavigate();

    const custom = useCustom();

    // Fetch connection method from configuration
    useEffect(() => {
        async function fetchEnabledMethod() {
            const res = await get('/auth/getEnabledLoginMethod');
            if (res.login_method_name) {
                setEnabledLoginMethod(res.login_method_name[0].method_name);
            }
        }

        fetchEnabledMethod().then();
    }, []);

    // Fetch login message from configuration if not already set
    useEffect(() => {
        async function getLoginMessage() {
            if (!loginMessage && custom) {
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

                const onboardingCompleted = localStorage.getItem('completedOnboardingSteps');
                const stepModules = import.meta.glob("./onboarding/step*.tsx", { eager: true });
                const totalSteps = Object.keys(stepModules).length;

                if (!onboardingCompleted || (JSON.parse(onboardingCompleted).length !== totalSteps)) {
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

    const handleNavigateToReset = () => {
        navigate('/reset-password');
    };

    return (
        <div className="flex h-screen flex-col items-center justify-between py-6 bg-(--bg-secondary)">
            <div className="flex flex-1 items-center justify-center w-full">
                <div className='bg-(--bg-primary) flex flex-col justify-center w-1/4 p-8 rounded-xl gap-12'>
                    <div className="sm:mx-auto w-4/5">
                        <LoginImage className="mx-auto"></LoginImage>
                    </div>

                    <div className='flex flex-col gap-4'>
                        <p dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(loginMessage) } }/>
                        <form onSubmit={ handleSubmit } noValidate>
                            <div className="mt-2 mb-2">
                                <Input id="username" type="text" name="username" required error={ errors.username }
                                       onChange={ handleChange } label={ t('USERS.username') }/>
                            </div>
                            <Input id="password" type="password" name="password" required error={ errors.password }
                                   onChange={ handleChange } label={ t('USERS.password') }/>

                            <div className="text-center">
                                <Button disabled={ !custom } loading={ loadingLogin } type="submit" size='md'
                                        className="w-full">
                                    { t('AUTH.login') }
                                </Button>
                                { !custom &&
                                    <p className="mt-2 text-sm text-(--text-secondary)">{ t('ERROR.custom_not_provided') }</p> }
                            </div>
                            { enabledLoginMethod === 'ldap' &&
                                <p className="mt-4 text-sm text-(--color-primary)/70">
                                    { t('SECURITY.using_ldap_connection') }
                                </p>
                            }
                        </form>
                        <p className='text-(--text-secondary) text-sm text-center'>
                            { t('AUTH.forgot_password') }&nbsp;
                            <span onClick={ handleNavigateToReset }
                                  className="cursor-pointer underline text-(--color-primary)">{ t('AUTH.reset_here') } </span>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-sm text-(--text-secondary) flex flex-col">
                <span className='text-center'>
                    Open-Capture { packageJson.version }
                </span>
                <span>
                    Powered by <a href="https://edissyum.com" target="_blank"
                                  className="underline text-(--color-primary)">Edissyum</a>
                </span>
            </div>
        </div>
    );
}
