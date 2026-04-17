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

import { z } from "zod";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";

import Hint from "../components/Hint";
import Input from "../components/Input";
import { Button } from "../components/Button";
import { handleLogout } from "../components/Sidebar";
import { Loader } from "../components/loader/Loader";
import { LoginImage } from "../components/LoginImage";
import { showToast } from "../components/ToastProvider";
import { DynamicForm } from "../components/form/DynamicForm";

import { axiosApiCall } from "../services/hooks/axiosApiCall";
import { usePasswordRules } from "../services/hooks/usePasswordRules";

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const { get, post, put } = axiosApiCall();
    const navigate = useNavigate();
    const { verifyPassword } = usePasswordRules();

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [smtpStatus, setSmtpStatus] = useState(true);

    useEffect(() => {
        const token = searchParams.get("reset_token");
        if (token) {
            setResetToken(token);
        }
    }, []);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const passwordSchema = z.object({
        password: z.string().describe(JSON.stringify({
            component: "input",
            type: "password",
            required: true,
            label: t("USERS.password")
        })),
        password_confirm: z.string().describe(JSON.stringify({
            component: "input",
            type: "password",
            required: true,
            label: t("USERS.password_confirm")
        })),
    }).refine((data) => data.password === data.password_confirm, {
        message: t('USERS.passwords_do_not_match'),
    });

    const { control, watch, setError, clearErrors, formState: { errors } } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {},
        mode: "onChange"
    });
    const password = watch('password');
    const passwordConfirm = watch('password_confirm');

    // Check password validity
    useEffect(() => {
        const errorMessage = verifyPassword(password);

        if (errorMessage) {
            setTimeout(() => {
                setError("password", { message: errorMessage });
            }, 0);
        } else {
            clearErrors("password");
        }

        if (password && passwordConfirm) {
            if (password !== passwordConfirm) {
                setError('password', { message: t('USERS.passwords_do_not_match') });
                setError('password_confirm', { message: t('USERS.passwords_do_not_match') });
            } else {
                clearErrors('password');
                clearErrors('password_confirm');
            }
        }
    }, [password, passwordConfirm]);

    // Check if smtp server is up
    useEffect(() => {
        const checkSmtpServer = async () => {
            try {
                const response = await get('/smtp/isServerUp')
                setSmtpStatus(response.status);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.debug(err);
            }
        };

        checkSmtpServer().then();
    }, []);

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    const checkEmail = (e: any) => {
        setEmail(e.target.value);
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(e.target.value)) {
            setEmailError(t('USERS.invalid_email'));
        } else {
            setEmailError('');
        }
    }

    const handleReset = async () => {
        if (Object.keys(errors).length > 0 || !password || !passwordConfirm) {
            return;
        }

        setSending(true);

        try {
            await put('/users/resetPassword', { resetToken: resetToken, newPassword: passwordConfirm });
            showToast(t('AUTH.password_reset_success'), 'success');
            handleLogout(navigate);
        } catch (err) {
            setSending(false);
            console.debug('Error while resetting password', err);
        }
    }

    const handleSendEmail = async () => {
        if (emailError || !email) {
            return;
        }

        setSending(true);

        try {
            const response = await post('/users/getByMail', { 'email': email })
            if (response && response.id) {
                const currentUrl = window.location.href.replace('/reset-password', '');
                await post('/users/sendEmailForgotPassword', { 'userId': response.id, 'currentUrl': currentUrl });
                showToast(t('AUTH.forgot_password_email_sent'), 'success');
                setSending(false);
            }
        } catch (err) {
            setSending(false);
            console.debug('Error while sending reset password email', err);
        }
    };

    if (loading) {
        return (
            <div className='h-screen'>
                <Loader/>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center py-6 bg-(--bg-secondary)">
            <div className="bg-(--bg-primary) h-auto flex justify-center w-130 p-8 rounded-xl">
                <div className='flex flex-1 flex-col'>
                    <div className="sm:mx-auto w-3/5 mb-10">
                        <LoginImage className="mx-auto"></LoginImage>
                    </div>
                    <div className='flex flex-col align-center h-full justify-center'>
                        <div className='font-bold mb-4'>
                            <span className='text-2xl'>{ t('AUTH.reset-password') }</span>
                        </div>
                        { !smtpStatus && (
                            <Hint variant="error">
                                { t('AUTH.smtp-server-down') }
                            </Hint>
                        ) }

                        { resetToken ? (
                            <div>
                                <DynamicForm schema={ passwordSchema } errors={ errors } control={ control }/>
                            </div>
                        ) : (
                            <div className="my-2">
                                <Input id="email" type="text" name="email" required disabled={ !smtpStatus }
                                       onChange={ checkEmail } error={ emailError }
                                       label={ t('USERS.email') }/>
                            </div>
                        ) }
                        <div className="mt-2">
                            { resetToken ? (
                                <Button loading={ sending } type="submit" className='w-full'
                                        disabled={ Object.keys(errors).length > 0 || !password || !passwordConfirm }
                                        onClick={ handleReset }>
                                    { t('AUTH.reset') }
                                </Button>
                            ) : (
                                <Button loading={ sending } type="submit" className='w-full'
                                        disabled={ !smtpStatus || !!emailError || !email }
                                        onClick={ handleSendEmail }>
                                    { t('AUTH.send_email') }
                                </Button>
                            )
                            }
                        </div>
                    </div>
                </div>
            </div>
            <p className='text-(--text-secondary) text-xs text-center mt-2'>
                { t('AUTH.know_password') }&nbsp;
                <span onClick={ handleNavigateToLogin }
                      className="cursor-pointer text-(--color-primary)">{ t('AUTH.login_here') } </span>
            </p>
        </div>
    )
}