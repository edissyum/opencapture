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

import z from "zod";
import DOMPurify from "dompurify";
import { useForm } from "react-hook-form";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { getI18n, useTranslation } from "react-i18next";

import packageJson from "../../package.json";

import { Button } from '../components/Button';
import { Loader } from "../components/loader/Loader";
import { LoginImage } from "../components/LoginImage";
import { showToast } from "../components/ToastProvider";
import { DynamicForm } from "../components/form/DynamicForm";

import { USER_KEY } from "../services/hooks/useUser";
import { useCustom } from "../services/custom/customContext";
import { AxiosApiCall } from "../services/hooks/AxiosApiCall";

export function Login() {
    const { t } = useTranslation();
    const { get, post } = AxiosApiCall();
    const custom = useCustom();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingLogin, setLoadingLogin] = useState(false);

    const [loginMessage, setLoginMessage] = useState<string>('');
    const [enabledLoginMethod, setEnabledLoginMethod] = useState<string>('');

    const [activeCard, setActiveCard] = useState<'guide' | 'capture'>('guide');
    document.title = t('AUTH.connexion') + " - Open-Capture";

    // Fetch connection method from configuration
    useEffect(() => {
        async function fetchEnabledMethod() {
            const res = await get('/auth/getEnabledLoginMethod');
            if (res.login_method_name) {
                setEnabledLoginMethod(res.login_method_name[0].method_name);
            }
            setLoading(false);
        }

        async function fetchLoginMessage() {
            await get("/config/getConfigurationNoAuth/loginMessage").then((response) => {
                if (response && response.configuration) {
                    setLoginMessage(response.configuration[0]?.data.value);
                }
            });
        }

        if (custom) {
            fetchLoginMessage().then();
            fetchEnabledMethod().then();
        }

        setLoading(false);
    }, []);

    const loginSchema: any = z.object({
        username: z.string().describe(JSON.stringify({
            component: "input",
            required: true,
            label: t("USERS.username")
        })),
        password: z.string().describe(JSON.stringify({
            component: "input",
            type: "password",
            required: true,
            label: t("USERS.password")
        }))
    });

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: ""
        },
        mode: "onChange"
    });

    const watchLogin = watch("username");
    const watchPassword = watch("password");

    const handleLogin = async (data: any) => {
        try {
            setLoadingLogin(true);
            data['lang'] = getI18n().language;

            const response = await post("/auth/login", data);
            if (response) {
                if (response.admin_password_alert) {
                    showToast(t('ERROR.admin_password_alert'), "warning");
                }

                sessionStorage.setItem("accessToken", response.auth_token);
                sessionStorage.setItem("refreshToken", response.refresh_token);
                sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));

                const onboardingCompleted = localStorage.getItem('completedOnboardingSteps');
                const stepModules = import.meta.glob("./onboarding/step*.tsx", { eager: true });
                const totalSteps = Object.keys(stepModules).length;

                const cachedUrl = localStorage.getItem(`${custom}_cachedUrl`);
                if (cachedUrl) {
                    localStorage.removeItem(`${custom}_cachedUrl`);
                    navigate(cachedUrl);
                    return;
                }

                if (!onboardingCompleted || (JSON.parse(onboardingCompleted).length !== totalSteps)) {
                    navigate('/onboarding', { replace: true });
                    setLoadingLogin(false);
                    return;
                }

                const defaultRoute = await get(`users/getDefaultRoute/${ response.user.id }`);
                if (defaultRoute && defaultRoute.route) {
                    navigate(defaultRoute.route, { replace: true });
                } else {
                    navigate('/home', { replace: true });
                }
            }
            setLoadingLogin(false);
        } catch {
            setLoadingLogin(false);
            return null;
        }
    }

    const handleNavigateToReset = () => {
        navigate('/reset-password');
    };

    const changeCard = () => {
        setActiveCard(activeCard === 'guide' ? 'capture' : 'guide');
    }

    if (loading) return (
        <div className='h-screen'>
            <Loader/>
        </div>
    );

    return (
        <div className="flex flex-col gap-2 h-screen items-center justify-between py-6 bg-(--bg-secondary)">
            <div className="flex flex-1 items-center justify-center w-full">
                <div className='bg-(--bg-primary) h-auto flex justify-center w-200 p-4 rounded-xl gap-6'>
                    <div className='bg-(--bg-primary) h-auto flex flex-1'>
                        <div className='group w-full bg-(--bg-selected) font-bold text-2xl overflow-hidden rounded-md flex
                                        flex-col relative aspect-[0.70]'>
                            <div className='group-hover:opacity-100 opacity-0 transition-all flex z-20 top-1/2
                                            justify-between absolute w-full text-(--text-secondary)'>
                                <ChevronLeft onClick={ changeCard } size={ 52 } className='cursor-pointer'/>
                                <ChevronRight onClick={ changeCard } size={ 52 } className='cursor-pointer'/>
                            </div>
                            <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
                                <span onClick={ () => setActiveCard('guide') }
                                      className={ `size-2 rounded-full cursor-pointer transition-colors
                                        ${ activeCard === 'guide' ? 'bg-(--color-primary)' : 'bg-(--bg-secondary)' }` }
                                />
                                <span onClick={ () => setActiveCard('capture') }
                                      className={ `size-2 rounded-full cursor-pointer transition-colors
                                            ${ activeCard === 'capture' ? 'bg-(--color-primary)' : 'bg-(--bg-secondary)' }` }
                                />
                            </div>
                            <div className='px-8 pt-12 relative transition-opacity'>
                                { activeCard === 'guide' && (
                                    <div className='flex-col gap-4 transition-all'>
                                        <span className='text-(--color-primary)'>{ t('AUTH.usage_guide') }</span>

                                        <a target='_blank'
                                           href="https://edissyum.gitbook.io/open-capture-v4/utilisation/introduction">
                                            <Button
                                                size='sm'
                                                variant='bg_white'
                                                className="px-3 font-medium text-(--text-primary)"
                                            >
                                                { t('AUTH.see_guide') }
                                                <ArrowRight size={ 16 }/>
                                            </Button>
                                        </a>

                                        <div className='w-full h-full'>
                                            <img
                                                src="/imgs/login/guide.svg"
                                                alt="Guide Preview"
                                                className='absolute left-48 top-80 rounded-md scale-200 rotate-[8deg]
                                                           transition-all ease-[cubic-bezier(0.22,1,0.36,1)]'
                                            />
                                        </div>
                                    </div>
                                ) }

                                { activeCard === 'capture' && (
                                    <div className='flex-col gap-4 transition-all'>
                                        <span className='text-(--color-primary)'>
                                            { t('AUTH.capture') }
                                        </span>
                                        <p className="text-sm text-(--text-secondary) font-normal">
                                            { t('AUTH.all_documents') }
                                        </p>
                                        <div className='w-full h-full'>
                                            <img
                                                src="/imgs/login/capture.svg"
                                                alt="Capture Preview"
                                                className='absolute left-48 top-80 rounded-md rotate-[8deg] scale-200
                                                           transition-all ease-[cubic-bezier(0.22,1,0.36,1)]'
                                            />
                                        </div>
                                    </div>
                                ) }
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-1 flex-col pr-2'>
                        <div className="sm:mx-auto w-3/5 mt-2">
                            <LoginImage className="mx-auto"></LoginImage>
                        </div>

                        <form onSubmit={ handleSubmit(handleLogin) }
                              className='flex flex-col gap-4 align-center h-full justify-center'>
                            <div className='flex flex-col'>
                                <span className='font-bold text-2xl'>{ t('AUTH.connexion') }</span>
                                { loginMessage ? (
                                    <span dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(loginMessage) } }/>
                                ) : (
                                    <span className='text-(--text-secondary) text-sm'>{ t('AUTH.welcome') }</span>
                                ) }
                            </div>

                            <div className='flex flex-col gap-4'>
                                <DynamicForm errors={ errors } control={ control } schema={ loginSchema }/>

                                <div className="text-center">
                                    <Button
                                        disabled={ !custom || !watchLogin || !watchPassword || Object.keys(errors).length > 0 }
                                        type='submit' loading={ loadingLogin } className="w-full">
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
                            </div>

                            { enabledLoginMethod === 'default' &&
                                <p className='text-(--text-secondary) text-xs text-center mt-2'>
                                    { t('AUTH.forgot_password') }&nbsp;
                                    <span onClick={ handleNavigateToReset }
                                          className="cursor-pointer text-(--color-primary)">{ t('AUTH.reset_here') } </span>
                                </p>
                            }
                        </form>
                    </div>
                </div>
            </div>
            <div className="flex flex-col text-sm text-(--text-secondary)">
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
